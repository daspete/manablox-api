'use strict'

const Database = use('Database')
const Drive = use('Drive')
const Helpers = use('Helpers')

class Data {

    constructor(){
        this.prefix = 'dm_';
        this.modelPath = 'data/models/';
        this.modelExtension = '.js';
        this.modelTemplatePath = 'data/templates/model.db';
    }

    async createTable(model, fields){
        await this.removeTable(model)

        Database.connection().knex.schema.createTable(this.prefix + model.model_slug, (table) => {
            table.increments();

            for(let x = 0; x < fields.length; x++){
                let field = fields[x];

                switch(field.type){
                    case 'relation_one':
                        if(field.required){
                            table.integer(field.name).notNullable()
                        }else{
                            table.integer(field.name)
                        }
                    break;
                    case 'relation_many':
                        if(field.required){
                            table.specificType(field.name, 'json').notNullable()
                        }else{
                            table.specificType(field.name, 'json')
                        }
                    break;
                    default:
                        if(field.required){
                            if(field.unique){
                                table[field.type](field.name).notNullable().unique()
                            }else{
                                table[field.type](field.name).notNullable()
                            }
                        }else{
                            if(field.unique){
                                table[field.type](field.name).unique()
                            }else{
                                table[field.type](field.name)
                            }
                        }
                    break;
                }
            }

            table.timestamps();
        }).then();
    }

    async removeTable(model){
        await Database.connection().knex.schema.dropTableIfExists(this.prefix + model.model_slug).then()
    }

    async createModel(model, fields){
        let modelTemplate = '';

        try {
            modelTemplate = await Drive.get(this.modelTemplatePath)
        }catch(e){
            console.log('model template not found')
            return false;
        }

        modelTemplate = modelTemplate.toString();
        modelTemplate = modelTemplate.replace(/{{ table_name }}/g, this.prefix + model.model_slug)

        try{
            await Drive.put(this.modelPath + model.model_slug + this.modelExtension, Buffer.from(modelTemplate));
        }catch(e){
            console.log('error while writing model file')
            return false;
        }

        return true;
    }

    async removeModel(model){
        const exists = await Drive.exists(this.modelPath + model.model_slug + this.modelExtension)

        if(exists){
            await Drive.delete(this.modelPath + model.model_slug + this.modelExtension)
        }
    }

    async LoadModel(name){
        let _model = require(Helpers.resourcesPath() + '/data/models/' + name + this.modelExtension)
        _model.boot();

        return _model;
    }
}

module.exports = Data
