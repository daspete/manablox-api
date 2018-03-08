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
        const modelName = request.params.slug

        let data = new Data()
        let model = await data.LoadModel(modelName)

        let dModel = await model.find(request.params.id);

        await response.status(200).send({ data: dModel });
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
        const modelName = request.params.slug
        const dataModel = await DataModel.findBy('model_slug', modelName)

        let relationOneFields = [];
        let relationManyFields = [];
        let x = null;

        for(x = 0; x < dataModel.fields.length; x++){
            if(dataModel.fields[x].type == 'relation_one'){
                relationOneFields.push(dataModel.fields[x].name);
            }
            if(dataModel.fields[x].type == 'relation_many'){
                relationManyFields.push(dataModel.fields[x].name);
            }
        }

        let data = new Data()
        let model = await data.LoadModel(modelName)

        let dModel = await model.find(request.params.id);

        let excludes = ['id', 'updated_at', 'created_at'];

        let values = request.except(excludes);
        let keys = Object.keys(values);

        for(x = 0; x < keys.length; x++){
            if(relationOneFields.indexOf(keys[x]) !== -1){
                if(typeof values[keys[x]] !== 'undefined' && values[keys[x]] != null && typeof values[keys[x]].id !== 'undefined'){
                    dModel[keys[x]] = values[keys[x]].id;
                }else{
                    dModel[keys[x]] = values[keys[x]];
                }

            }else if(relationManyFields.indexOf(keys[x]) !== -1){
                if(typeof values[keys[x]] !== 'undefined' && typeof values[keys[x]].length !== 'undefined' && typeof values[keys[x]][0] !== 'undefined' && typeof values[keys[x]][0].id !== 'undefined'){
                    let vals = [];

                    for(let i = 0; i < values[keys[x]].length; i++){
                        vals.push(values[keys[x]][i].id);
                    }

                    dModel[keys[x]] = JSON.stringify(vals);
                }else{
                    dModel[keys[x]] = JSON.stringify(values[keys[x]]);
                }
            }else{
                dModel[keys[x]] = values[keys[x]];
            }

        }

        await dModel.save();
    }

    async destroy({ request, response }){
        const modelName = request.params.slug

        let data = new Data()
        let model = await data.LoadModel(modelName)

        let dModel = await model.find(request.params.id);
        if(dModel){
            try{
                await dModel.delete()
                await response.status(200).send({ success: true })
            }catch(e){
                await response.status(500).send({ error: { message: 'Error while deleting the object' }})
            }
        }else{
            await response.status(404).send({ error: { message: 'Object not found' }})
        }
    }

}

module.exports = DataModelDataController
