import request from '@/utils/request'

const module = '/quiz/student/question/favorite'

export function getFavoriteList(params) {
  return request({
    url: `${module}/list`,
    method: 'get',
    params
  })
}

export function addFavorite(data) {
  return request({
    url: `${module}`,
    method: 'post',
    data
  })
}

export function removeFavorite(questionId) {
  return request({
    url: `${module}/${questionId}`,
    method: 'delete'
  })
}

export function getFavoriteDetailList(params) {
  return request({
    url: `${module}/detail`,
    method: 'get',
    params
  })
}


