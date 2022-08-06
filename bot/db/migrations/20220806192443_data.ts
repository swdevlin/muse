exports.up = function(knex) {
  return knex('channel').update({personality: 5}).where({personality: 1});
};

exports.down = function(knex) {
};
