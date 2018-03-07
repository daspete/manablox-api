'use strict'

const DataModel = use('App/Models/DataModel')
const Helpers = use('Helpers')
const Drive = use('Drive')
const Data = use('App/Data/Data')
const Database = use('Database')

class DataModelDataController {

    async index({ request, response }){

    }

    async show({ request, response }){

    }

    async store({ request, response }){
        const modelName = request.params.slug

        let data = new Data()
        let dModel = await data.LoadModel(modelName)

        const dataModel = await DataModel.findBy('model_slug', modelName)
        for(let x = 0; x < dataModel.fields.length; x++){
            let fieldName = dataModel.fields[x].name

            if(typeof request.input(fieldName) !== 'undefined'){
                dModel[fieldName] = request.input(fieldName)
            }
        }

        await dModel.save()
    }

    async update({ request, response }){

    }

    async destroy({ request, response }){

    }

}

module.exports = DataModelDataController
