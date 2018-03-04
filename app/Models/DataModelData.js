'use strict'

const Model = use('Model')

class DataModelData extends Model {
    static get table() {
        return 'data_models_data'
    }

    static boot() {
        super.boot()

        this.addTrait('@provider:Jsonable', [
            'data'
        ])
    }
}

module.exports = DataModelData
