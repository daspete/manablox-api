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
        let query = request.get();
        let datamodel = null;

        if(query.by){
            datamodel = await DataModel.findBy(query.by, request.params.id)
        }else{
            datamodel = await DataModel.find(request.params.id)
        }

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
        dataModel.fields_for_select = request.input('fields_for_select')
        dataModel.fields_in_lists = request.input('fields_in_lists')
        dataModel.fields = request.input('fields')

        const data = new Data()
        await data.createTable(dataModel, request.input('fields'))
        await data.createModel(dataModel, request.input('fields'))

        await dataModel.save()

        await response.status(201).send({ success: true })
    }

    async update({ request, response }){
        const dataModel = await DataModel.find(request.params.id)

        if(dataModel){
            dataModel.model_name = request.input('model_name')
            dataModel.model_slug = request.input('model_slug')
            dataModel.model_description = request.input('model_description')
            dataModel.fields_for_select = request.input('fields_for_select')
            dataModel.fields_in_lists = request.input('fields_in_lists')

            const data = new Data()
            await data.updateTable(dataModel, {
                orig: JSON.parse(JSON.stringify(dataModel.fields)),
                update: request.input('fields')
            })

            dataModel.fields = request.input('fields')
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
                const data = new Data()
                await data.removeTable(dataModel)
                await data.removeModel(dataModel)
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
