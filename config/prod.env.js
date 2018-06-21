'use strict'
module.exports = {
  NODE_ENV: '"production"',
  EXT_ENV: process.env.EXT_ENV ? `"${process.env.EXT_ENV}"` : '""',
  SUBDIRECTORY: process.env.SUBDIRECTORY ? `"${process.env.SUBDIRECTORY}"` : '""',
  GH_USER: process.env.GH_USER ? `"${process.env.GH_USER}"` : '""',
  GH_TOKEN: process.env.GH_TOKEN ? `"${process.env.GH_TOKEN}"` : '""',
}
