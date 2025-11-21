import request from '@/utils/request'

const module = '/quiz/student/question/answer'

export function getWrongQuestionList(params) {
  return request({
    url: `${module}/wrongList`,
    method: 'get',
    params
  })
}

