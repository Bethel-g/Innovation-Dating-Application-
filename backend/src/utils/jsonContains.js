import { literal } from 'sequelize';

const jsonbContains = (column, value) => {
  const val = Array.isArray(value) ? JSON.stringify(value) : JSON.stringify([value]);
  return literal(`"${column}"::jsonb @> '${val}'::jsonb`);
};

const jsonbContainsWhere = (column, value) => {
  const val = Array.isArray(value) ? JSON.stringify(value) : JSON.stringify([value]);
  return literal(`"${column}"::jsonb @> '${val}'::jsonb`);
};

export { jsonbContains, jsonbContainsWhere };
export default jsonbContains;
