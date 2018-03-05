'use strict'

const DataModel = use('App/Models/DataModel')
const DataModelData = use('App/Models/DataModelData')

class DataModelController {

    async index({ request, response }){
        const dataModels = await DataModel.all();

        await response.send({
            models: dataModels
        });
    }

    async show({ request, response }){
        const id = request.params.id
        const datamodel = await DataModel.find(id)

        if(datamodel){
            await response.send(datamodel);
        }else{
            await response.status(404).send({
                error: {
                    message: 'DataModel not found'
                }
            })
        }
    }

    async store({ request, response }){
        const dataModel = new DataModel();
        dataModel.model_name = request.input('model_name');
        dataModel.model_slug = request.input('model_slug');
        dataModel.model_description = request.input('model_description');
        dataModel.fields = request.input('fields');
        dataModel.relations = request.input('relations');

        let modelData = request.all();

        await dataModel.save();

        await response.json({
            success: true,
            model: dataModel
        });

    }

    async update({ request, response }){
        const id = request.params.id
        const dataModel = await DataModel.find(id)

        if(dataModel){
            dataModel.model_name = request.input('model_name')
            dataModel.model_slug = request.input('model_slug')
            dataModel.model_description = request.input('model_description')


            await dataModel.save();



        }else{
            await response.status(404).send({
                error: {
                    message: 'DataModel not found'
                }
            })
        }
    }

    async destroy({ request, response }) {
        const id = request.params.id
        const dataModel = await DataModel.find(id);
        if (dataModel) {
            try {
                await dataModel.delete()
                response.json({ success: true, message: 'DataModel has been deleted' });
            } catch (e) {
                response.json({ success: false, message: 'Error, deleting the DataModel', error: e });
            }
        } else {
            response.json({ success: false, message: 'Unable to find DataModel to delete' });
        }

        response.send(request.params());
    }

}

module.exports = DataModelController
