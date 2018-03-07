'use strict'

const DataModel = use('App/Models/DataModel')
const Helpers = use('Helpers')
const Drive = use('Drive')
const Data = use('App/Data/Data')
const Database = use('Database')

class DataModelDataController {

    async index({ request, response }){
        const modelName = request.params.slug

        let data = new Data()
        let dModel = await data.LoadModel(modelName)
        let modelData = await dModel.all()
        modelData = modelData.toJSON()

        let foreignData = null
        let foreignModel = null
        let foreignModelData = null
        let foreignModelIDs = null


        const dataModel = await DataModel.findBy('model_slug', modelName)

        for(let i = 0; i < modelData.length; i++){
            for(let x = 0; x < dataModel.fields.length; x++){
                switch(dataModel.fields[x].type){
                    case 'relation_one':
                        foreignData = new Data()
                        foreignModel = await foreignData.LoadModelById(dataModel.fields[x].relation_one)
                        foreignModelData = await foreignModel.find(modelData[i][dataModel.fields[x].name])

                        modelData[i][dataModel.fields[x].name] = foreignModelData
                    break;
                    case 'relation_many':
                        if(!modelData[i][dataModel.fields[x].name]) continue

                        foreignData = new Data()
                        foreignModel = await foreignData.LoadModelById(dataModel.fields[x].relation_many)
                        foreignModelIDs = JSON.parse(modelData[i][dataModel.fields[x].name]);
                        foreignModelData = await foreignModel
                            .query()
                            .whereIn('id', foreignModelIDs)
                            .fetch()

                        modelData[i][dataModel.fields[x].name] = foreignModelData

                    break;
                }
            }
        }

        await response.status(200).send(modelData)
    }

    async show({ request, response }){

    }

    async store({ request, response }){
        const modelName = request.params.slug

        let data = new Data()
        let model = await data.LoadModel(modelName)
        let dModel = new model()
        let foreignData = null
        let foreignModel = null
        let foreignStoreData = null
        let foreignModelData = null

        const dataModel = await DataModel.findBy('model_slug', modelName)
        for(let x = 0; x < dataModel.fields.length; x++){
            let fieldName = dataModel.fields[x].name

            if(typeof request.input(fieldName) === 'undefined') continue

            switch(dataModel.fields[x].type){
                case 'relation_one':
                    foreignData = new Data()
                    foreignModel = await foreignData.LoadModelById(dataModel.fields[x].relation_one)
                    foreignStoreData = request.input(fieldName)
                    foreignModelData = await foreignModel.find(foreignStoreData)

                    if(foreignModelData){
                        dModel[fieldName] = foreignModelData.id
                    }else{
                        dModel[fieldName] = null
                    }
                break;
                case 'relation_many':
                    foreignData = new Data()
                    foreignModel = await foreignData.LoadModelById(dataModel.fields[x].relation_many)
                    foreignStoreData = request.input(fieldName)
                    foreignModelData = await foreignModel
                        .query()
                        .whereIn('id', foreignStoreData)
                        .get()
                        .pluck('id')

                    if(foreignModelData){
                        dModel[fieldName] = JSON.stringify(foreignModelData)
                    }else{
                        dModel[fieldName] = null
                    }
                break;
                default:
                    dModel[fieldName] = request.input(fieldName)
            }


        }

        await dModel.save()

        await response.status(201).send({ success: true })
    }

    async update({ request, response }){

    }

    async destroy({ request, response }){

    }

}

module.exports = DataModelDataController
