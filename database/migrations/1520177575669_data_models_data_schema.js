'use strict'

const Schema = use('Schema')

class DataModelsDataSchema extends Schema {
  up () {
    this.create('data_models_data', (table) => {
      table.increments()

      table.integer('data_model_id').unsigned()
      table.string('field')
      table.specificType('data', 'json')

      table.foreign('data_model_id').references('id').on('data_models').onDelete('cascade')

      table.timestamps()
    })
  }

  down () {
    this.drop('data_models_data')
  }
}

module.exports = DataModelsDataSchema
