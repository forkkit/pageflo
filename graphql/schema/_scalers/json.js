
let { GraphQLScalarType } = require('graphql')
let { gql } = require('apollo-server-koa')
let _ = require('lodash')

let typeDefs = gql`
  scalar JSON
`

let getAstValue = function (field) {
  let value = null

  if (field.kind === 'StringValue') {
    value = field.value
  } else if (field.kind === 'IntValue') {
    value = parseInt(field.value, 10)
  } else if (field.kind === 'FloatValue') {
    value = parseFloat(field.value)
  } else if (field.kind === 'ObjectValue') {
    value = {}
    for (let subField of field.fields) {
      value[subField.name.value] = getAstValue(subField)
    }
  } else if (field.kind === 'ObjectField') {
    value = getAstValue(field.value)
  } else if (field.kind === 'ListValue') {
    value = []
    for (let subField of field.values) {
      value.push(getAstValue(subField))
    }
  }

  return value
}

let resolvers = {
  JSON: new GraphQLScalarType({
    name: 'JSON',
    description: 'JSON Data',
    parseValue: function (value) {
      let result = null

      if (value != null) {
        if (_.isPlainObject(value) || _.isArray(value)) {
          result = value
        } else if (_.isString(value)) {
          result = JSON.parse(value)
        }
      }

      return result
    },
    serialize: function (value) {
      let result = null

      if (value != null) {
        if (_.isPlainObject(value) || _.isArray(value)) {
          result = value
        }
      }

      return result
    },
    parseLiteral: function (ast) {
      let value = null

      if (ast.kind === 'ObjectValue') {
        value = getAstValue(ast)
      }

      return value
    }
  })
}

module.exports = {
  typeDefs,
  resolvers
}
