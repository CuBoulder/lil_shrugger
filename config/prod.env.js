'use strict'
module.exports = {
  NODE_ENV: '"production"',
  EXT_ENV: process.env.EXT_ENV ? `"${process.env.EXT_ENV}"` : '""',
  SUBDIRECTORY: process.env.SUBDIRECTORY ? `"${process.env.SUBDIRECTORY}"` : '""',
}
