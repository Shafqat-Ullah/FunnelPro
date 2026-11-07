const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'funnelpro_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache synced with disk
let dbCache = null;

function loadDb() {
  if (dbCache) return dbCache;
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      dbCache = JSON.parse(data);
    } else {
      dbCache = {};
      saveDb();
    }
  } catch (err) {
    console.error('Error loading db file, resetting cache:', err.message);
    dbCache = {};
  }
  return dbCache;
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbCache || {}, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing db file:', err.message);
  }
}

function matchQuery(doc, query) {
  if (!query || Object.keys(query).length === 0) return true;
  for (const [key, val] of Object.entries(query)) {
    if (key === '$or' && Array.isArray(val)) {
      const matched = val.some(subQuery => matchQuery(doc, subQuery));
      if (!matched) return false;
      continue;
    }
    if (key === '$and' && Array.isArray(val)) {
      const matched = val.every(subQuery => matchQuery(doc, subQuery));
      if (!matched) return false;
      continue;
    }

    const docVal = doc[key];
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      if (val.$ne !== undefined && docVal === val.$ne) return false;
      if (val.$in !== undefined && (!Array.isArray(val.$in) || !val.$in.includes(docVal))) return false;
      if (val.$nin !== undefined && Array.isArray(val.$nin) && val.$nin.includes(docVal)) return false;
      if (val.$regex !== undefined) {
        const flags = val.$options || 'i';
        const regex = new RegExp(val.$regex, flags);
        if (!regex.test(String(docVal || ''))) return false;
      }
      if (val.$gte !== undefined && Number(docVal) < Number(val.$gte)) return false;
      if (val.$lte !== undefined && Number(docVal) > Number(val.$lte)) return false;
      if (val.$gt !== undefined && Number(docVal) <= Number(val.$gt)) return false;
      if (val.$lt !== undefined && Number(docVal) >= Number(val.$lt)) return false;
    } else {
      if (docVal !== val && String(docVal) !== String(val)) {
        return false;
      }
    }
  }
  return true;
}

class QueryCursor {
  constructor(collectionName, query = {}) {
    this.collectionName = collectionName;
    this.query = query;
    this._sort = null;
    this._limit = null;
    this._skip = 0;
    this._selectFields = null;
    this._populateField = null;
  }

  sort(sortObj) {
    this._sort = sortObj;
    return this;
  }

  limit(num) {
    this._limit = Number(num);
    return this;
  }

  skip(num) {
    this._skip = Number(num);
    return this;
  }

  select(fields) {
    this._selectFields = fields;
    return this;
  }

  populate(field) {
    this._populateField = field;
    return this;
  }

  lean() {
    return this;
  }

  async exec() {
    const db = loadDb();
    const list = db[this.collectionName] || [];
    let results = list.filter(item => matchQuery(item, this.query));

    // Sort
    if (this._sort) {
      const [sortKey, sortDir] = Object.entries(this._sort)[0] || ['createdAt', -1];
      const dir = sortDir === -1 || sortDir === 'desc' ? -1 : 1;
      results.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA === valB) return 0;
        return (valA > valB ? 1 : -1) * dir;
      });
    }

    // Skip
    if (this._skip > 0) {
      results = results.slice(this._skip);
    }

    // Limit
    if (this._limit !== null && this._limit >= 0) {
      results = results.slice(0, this._limit);
    }

    // Return wrapped documents with save()
    return results.map(doc => wrapDoc(this.collectionName, doc));
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

function wrapDoc(collectionName, doc) {
  if (!doc) return null;
  const wrapped = { ...doc };
  wrapped.save = async function () {
    const db = loadDb();
    const list = db[collectionName] || [];
    const idx = list.findIndex(i => String(i._id) === String(wrapped._id));
    wrapped.updatedAt = new Date().toISOString();
    if (idx !== -1) {
      list[idx] = { ...wrapped };
    } else {
      list.push(wrapped);
    }
    db[collectionName] = list;
    saveDb();
    return wrapped;
  };
  return wrapped;
}

function createModel(collectionName, defaultValues = {}) {
  return {
    collectionName,
    find(query = {}) {
      return new QueryCursor(collectionName, query);
    },
    async findOne(query = {}) {
      const db = loadDb();
      const list = db[collectionName] || [];
      const item = list.find(doc => matchQuery(doc, query));
      return item ? wrapDoc(collectionName, item) : null;
    },
    async findById(id) {
      if (!id) return null;
      const db = loadDb();
      const list = db[collectionName] || [];
      const item = list.find(doc => String(doc._id) === String(id));
      return item ? wrapDoc(collectionName, item) : null;
    },
    async create(docData) {
      const db = loadDb();
      if (!db[collectionName]) db[collectionName] = [];
      const now = new Date().toISOString();
      const newDoc = {
        _id: uuidv4(),
        ...defaultValues,
        ...docData,
        createdAt: now,
        updatedAt: now
      };
      db[collectionName].push(newDoc);
      saveDb();
      return wrapDoc(collectionName, newDoc);
    },
    async insertMany(docs) {
      const db = loadDb();
      if (!db[collectionName]) db[collectionName] = [];
      const now = new Date().toISOString();
      const inserted = docs.map(d => ({
        _id: d._id || uuidv4(),
        ...defaultValues,
        ...d,
        createdAt: d.createdAt || now,
        updatedAt: d.updatedAt || now
      }));
      db[collectionName].push(...inserted);
      saveDb();
      return inserted.map(d => wrapDoc(collectionName, d));
    },
    async findByIdAndUpdate(id, update, options = { new: true }) {
      const db = loadDb();
      const list = db[collectionName] || [];
      const idx = list.findIndex(doc => String(doc._id) === String(id));
      if (idx === -1) return null;

      let current = list[idx];
      let updatedData = { ...current };

      if (update.$set) {
        Object.assign(updatedData, update.$set);
      } else {
        Object.assign(updatedData, update);
      }

      if (update.$inc) {
        for (const [k, v] of Object.entries(update.$inc)) {
          updatedData[k] = (Number(updatedData[k]) || 0) + Number(v);
        }
      }

      if (update.$push) {
        for (const [k, v] of Object.entries(update.$push)) {
          if (!Array.isArray(updatedData[k])) updatedData[k] = [];
          updatedData[k].push(v);
        }
      }

      updatedData.updatedAt = new Date().toISOString();
      list[idx] = updatedData;
      saveDb();
      return wrapDoc(collectionName, options.new ? updatedData : current);
    },
    async findOneAndUpdate(query, update, options = { new: true }) {
      const item = await this.findOne(query);
      if (!item) return null;
      return this.findByIdAndUpdate(item._id, update, options);
    },
    async findByIdAndDelete(id) {
      const db = loadDb();
      const list = db[collectionName] || [];
      const idx = list.findIndex(doc => String(doc._id) === String(id));
      if (idx === -1) return null;
      const [removed] = list.splice(idx, 1);
      saveDb();
      return wrapDoc(collectionName, removed);
    },
    async findOneAndDelete(query) {
      const item = await this.findOne(query);
      if (!item) return null;
      return this.findByIdAndDelete(item._id);
    },
    async deleteMany(query = {}) {
      const db = loadDb();
      const list = db[collectionName] || [];
      if (Object.keys(query).length === 0) {
        const deletedCount = list.length;
        db[collectionName] = [];
        saveDb();
        return { deletedCount };
      }
      const remaining = list.filter(item => !matchQuery(item, query));
      const deletedCount = list.length - remaining.length;
      db[collectionName] = remaining;
      saveDb();
      return { deletedCount };
    },
    async countDocuments(query = {}) {
      const db = loadDb();
      const list = db[collectionName] || [];
      return list.filter(item => matchQuery(item, query)).length;
    }
  };
}

module.exports = {
  createModel,
  loadDb,
  saveDb
};

