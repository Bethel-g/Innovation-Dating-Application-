export const parsePagination = (query, defaults = {}) => {
  const { page: rawPage = 1, limit: rawLimit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
  const page = Math.max(parseInt(rawPage, 10) || defaults.page || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(rawLimit, 10) || defaults.limit || 20, 1),
    defaults.maxLimit || 100
  );
  const offset = (page - 1) * limit;
  return {
    page,
    limit,
    offset,
    order: [[sortBy, sortOrder === 'ASC' ? 'ASC' : 'DESC']],
  };
};

export const paginationMeta = (page, limit, count) => ({
  page,
  limit,
  count,
  totalPages: Math.ceil(count / limit) || 0,
});