const { Attendance } = require('../models')

const moment = require('moment')
async function getAttendances (ctx) {
  const result = await Attendance.aggregate([
    { $match: { zone: 1006 } },
    {
      $group: { _id: '$date', characters: { $push: { name: '$character', buffsCount: '$buffsCount', status: '$status' } } }
    },

    { $sort: { _id: -1 } }

  ])
  ctx.ok(result)
}

module.exports = {
  getAttendances

}
