import { literal } from 'sequelize';

const escape = (value) => String(value).replace(/'/g, "''");

const quoteColumn = (column) => String(column).split('.').map(p => `"${p}"`).join('.');

const jsonbContains = (column, value) => {
  const val = Array.isArray(value) ? JSON.stringify(value) : JSON.stringify([value]);
  return literal(`${quoteColumn(column)}::jsonb @> '${escape(val)}'::jsonb`);
};

const jsonbContainsWhere = (column, value, symbol = '@>') => {
  const val = Array.isArray(value) ? JSON.stringify(value) : JSON.stringify([value]);
  return literal(`${quoteColumn(column)}::jsonb ${symbol} '${escape(val)}'::jsonb`);
};

const jsonbContainsAny = (column, values) => {
  const arr = Array.isArray(values) ? values : [values];
  return literal(`${quoteColumn(column)}::jsonb ?| array[${arr.map(v => `'${escape(v)}'`).join(',')}]`);
};

export { jsonbContains, jsonbContainsWhere, jsonbContainsAny };
export default jsonbContains;
