'use strict'

const Database = use('Database')
const Drive = use('Drive')
const Helpers = use('Helpers')

class Data {

    constructor(){
        this.prefix = 'dm_';
    }

    async createTable(model, fields){
        Database.connection().knex.schema.createTable(this.prefix + model.model_slug, (table) => {
            table.increments();

            for(let x = 0; x < fields.length; x++){
                let field = fields[x];

                switch(field.type){
                    case 'relation_one': break;
                    case 'relation_many': break;
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

    async createModel(data){
        let modelTemplate = '';

        try {
            modelTemplate = await Drive.get('data/templates/model.db')
        }catch(e){
            console.log('model template not found')
            return false;
        }

        modelTemplate = modelTemplate.toString();
        modelTemplate = modelTemplate.replace(/{{ table_name }}/g, this.prefix + data.model_name)

        try{
            await Drive.put('data/models/' + data.model_name + '.db', Buffer.from(modelTemplate));
        }catch(e){
            console.log('error while writing model file')
            return false;
        }

        return true;
    }

    async LoadModel(name){
        let _model = require(Helpers.resourcesPath() + '/data/models/' + name + '.db')
        _model.boot();

        return new _model();
    }
}

module.exports = Data
