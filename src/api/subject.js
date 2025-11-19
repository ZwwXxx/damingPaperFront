import request from '@/utils/request'

export function optionSubject() {
  return request({
    url: '/quiz/subject/options',
    method: 'get'
  })
}


