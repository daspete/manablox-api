'use strict'

const DataModel = use('App/Models/DataModel')
const Data = use('App/Data/Data')

class DataModelController {

    async index({ request, response }){
        const dataModels = await DataModel.all()

        await response.send({
            models: dataModels
        })
    }

    async show({ request, response }){
        const datamodel = await DataModel.find(request.params.id)

        if(datamodel){
            await response.status(200).send(datamodel)
        }else{
            await response.status(404).send({ error: { message: 'DataModel not found' }})
        }
    }

    async store({ request, response }){
        const dataModel = new DataModel()
        dataModel.model_name = request.input('model_name')
        dataModel.model_slug = request.input('model_slug')
        dataModel.model_description = request.input('model_description')
        dataModel.fields = request.input('fields')

        const data = new Data()
        await data.createTable(dataModel, request.input('fields'))
        await data.createModel({
            model_name: dataModel.model_slug
        })

        await dataModel.save()

        await response.status(201).send({ success: true })
    }

    async update({ request, response }){
        const dataModel = await DataModel.find(request.params.id)

        if(dataModel){
            dataModel.model_name = request.input('model_name')
            dataModel.model_slug = request.input('model_slug')
            dataModel.model_description = request.input('model_description')
            await dataModel.save()

            await response.status(200).send({ success: true })
        }else{
            await response.status(404).send({ error: { message: 'DataModel not found' }})
        }
    }

    async destroy({ request, response }) {
        const dataModel = await DataModel.find(request.params.id)
        if(dataModel){
            try{
                await dataModel.delete()

                await response.status(200).send({ success: true })
            }catch(e){
                await response.status(500).send({ error: { message: 'Error while deleting the data model' }})
            }
        }else{
            await response.status(404).send({ error: { message: 'Data model not found' }})
        }
    }

}

module.exports = DataModelController
