import request from '@/utils/request'

const module = '/quiz/student/practice'

export function listPracticeColumns(params) {
  return request({
    url: `${module}/columns`,
    method: 'get',
    params
  })
}

export function getPracticePaperId(columnId) {
  return request({
    url: `${module}/columns/${columnId}/paperId`,
    method: 'get'
  })
}

