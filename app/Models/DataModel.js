'use strict'

const Model = use('Model')

class DataModel extends Model {

    static get table() {
        return 'data_models'
    }

    static boot() {
        super.boot()

        this.addTrait('@provider:Jsonable', [
            'fields',
            'fields_for_select',
            'fields_in_lists'
        ])
    }

}

module.exports = DataModel
