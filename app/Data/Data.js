'use strict'

const Database = use('Database')
const Drive = use('Drive')
const Helpers = use('Helpers')
const DataModel = use('App/Models/DataModel')
const Config = use('Config')

class Data {

    constructor(){
        this.prefix = 'dm_';
        this.modelPath = 'data/models/';
        this.modelExtension = '.js';
        this.modelTemplatePath = 'data/templates/model.db';
    }

    getFieldType(fieldType){
        let returnValue = fieldType;

        let fieldTypes = Config.get('datamodel.fieldTypes')
        let _fieldType = fieldTypes.find((item) => { return item.type == fieldType })

        if(_fieldType && typeof _fieldType.nativeType !== 'undefined'){
            returnValue = _fieldType.nativeType
        }else{
            returnValue = fieldType
        }

        return returnValue
    }

    async createTable(model, fields){
        await this.removeTable(model)

        Database.connection().knex.schema.createTable(this.prefix + model.model_slug, (table) => {
            table.increments();

            for(let x = 0; x < fields.length; x++){
                let field = fields[x];

                let fieldType = this.getFieldType(field.type)

                switch(fieldType){
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
                                table[fieldType](field.name).notNullable().unique()
                            }else{
                                table[fieldType](field.name).notNullable()
                            }
                        }else{
                            if(field.unique){
                                table[fieldType](field.name).unique()
                            }else{
                                table[fieldType](field.name)
                            }
                        }
                    break;
                }
            }

            table.timestamps();
        }).then();
    }

    async updateTable(model, fields){
        let origFields = [];
        let newFields = [];

        let deletes = [];
        let updates = [];
        let inserts = [];

        let x = null;

        for(x = 0; x < fields.orig.length; x++){
            let newField = fields.update.find((el) => { return el.name == fields.orig[x].name });

            if(typeof newField === 'undefined'){
                deletes.push(fields.orig[x])
            }else{
                let o = JSON.stringify(fields.orig[x])
                let u = JSON.stringify(newField)

                if(o != u){
                    updates.push(newField);
                }
            }
        }

        for(x = 0; x < fields.update.length; x++){
            let oldField = fields.orig.find((el) => { return el.name == fields.update[x].name });

            if(typeof oldField === 'undefined'){
                inserts.push(fields.update[x])
            }
        }

        for(x = 0; x < deletes.length; x++){
            let field = deletes[x];

            Database.connection().knex.schema.table(this.prefix + model.model_slug, (table) => {
                table.dropColumn(field.name)
            }).then()
        }

        for(x = 0; x < updates.length; x++){
            let field = updates[x];

            Database.connection().knex.schema.table(this.prefix + model.model_slug, (table) => {
                table.dropColumn(field.name)
            }).then()

            Database.connection().knex.schema.table(this.prefix + model.model_slug, (table) => {
                let fieldType = this.getFieldType(field.type)

                switch(fieldType){
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
                                table[fieldType](field.name).notNullable().unique()
                            }else{
                                table[fieldType](field.name).notNullable()
                            }
                        }else{
                            if(field.unique){
                                table[fieldType](field.name).unique()
                            }else{
                                table[fieldType](field.name)
                            }
                        }
                    break;
                }
            }).then()
        }

        for(x = 0; x < inserts.length; x++){
            let field = inserts[x];

            Database.connection().knex.schema.table(this.prefix + model.model_slug, (table) => {
                let fieldType = this.getFieldType(field.type)

                switch(fieldType){
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
                                table[fieldType](field.name).notNullable().unique()
                            }else{
                                table[fieldType](field.name).notNullable()
                            }
                        }else{
                            if(field.unique){
                                table[fieldType](field.name).unique()
                            }else{
                                table[fieldType](field.name)
                            }
                        }
                    break;
                }
            }).then()
        }

        // console.log('updates', updates);
        // console.log('deletes', deletes);
        // console.log('inserts', inserts);

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

    async LoadModelById(id){
        let dataModel = await DataModel.find(id)

        let _model = require(Helpers.resourcesPath() + '/data/models/' + dataModel.model_slug + this.modelExtension)
        _model.boot();

        return _model;
    }
}

module.exports = Data
