'use strict'

const Helpers = use('Helpers')
const Env = use('Env')

module.exports = {


    fieldTypes: [
        {
            type: 'boolean',
            label: 'Boolean'
        },
        {
            type: 'integer',
            label: 'Number (integer)'
        },
        {
            type: 'float',
            label: 'Number (float)'
        },
        {
            type: 'string',
            label: 'String'
        },
        {
            type: 'text',
            label: 'Text',
            config: [
                {
                    label: 'WYSIWYG',
                    type: 'wysiwyg',
                    valueType: 'boolean'
                }
            ]
        },
        {
            type: 'json',
            label: 'JSON',
            nativeType: 'text'
        },
        {
            type: 'upload',
            label: 'Upload',
            nativeType: 'string',
            config: [
                {
                    label: 'Multiple',
                    type: 'multiple',
                    valueType: 'boolean'
                }
            ]
        },
        {
            type: 'date',
            label: 'Date'
        },
        {
            type: 'datetime',
            label: 'Date and time'
        },
        {
            type: 'time',
            label: 'Time'
        },
        {
            type: 'relation_one',
            label: 'Relation to one'
        },
        {
            type: 'relation_many',
            label: 'Relation to many'
        }
    ]
}
