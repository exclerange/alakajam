'use strict'

/**
 * Post model
 *
 * @module models/post-model
 */

let slug = require('slug')
let db = require('../core/db')

module.exports = createModel()

function createModel () {
  let modelPrototype = db.Model.prototype

  let model = db.model('Post', {
    tableName: 'post',
    hasTimestamps: true,

    initialize: function initialize (attrs) {
      modelPrototype.initialize.call(this)
      this.on('saving', function (model, attrs, options) {
        model.set('name', slug(model.get('title') || ''))
      })
      return attrs
    },
    entry: function () {
      return this.belongsTo('Entry', 'entry_id')
    },
    event: function () {
      return this.belongsTo('Event', 'event_id')
    },
    author: function () {
      return this.belongsTo('User', 'author_user_id')
    },
    userRoles: function () {
      // TODO isn't it sufficient to specify either 'node' or ['node_type', 'node_id']?
      return this.morphMany('UserRole', 'node', ['node_type', 'node_id'])
    },
    comments: function () {
      return this.morphMany('Comment', 'node', ['node_type', 'node_id'])
    }
  })

  model.up = async function up (applyVersion) {
    if (applyVersion === 1) {
      await db.knex.schema.createTableIfNotExists('post', function (table) {
        table.increments('id').primary()
        table.string('author_user_id')
        table.string('name')
        table.string('title')
        table.string('guild_id')
        table.string('entry_id')
        table.string('event_id')
        table.string('body', 10000)
        table.date('published_at')
        table.string('special_post_type')
        table.timestamps()
      })
    }
  }

  model.down = async function down () {
    await db.knex.schema.dropTableIfExists('post')
  }

  return model
}
