import axios from 'axios'

export const req1 = () => axios.get('http://127.0.0.1:9999/axios-success')
export const req2 = () => {
  return axios.get('http://127.0.0.1:9999/axios-success')
}

export const req3 = params =>
  axios.post('http://127.0.0.1:9999/axios-success', {
    data: params,
  })

export const failedReq = () => axios.get('http://127.0.0.1:9999/axios-failed')

let retryTimes = 2
export const failedReq2 = () => {
  if (retryTimes--) {
    return axios.get('http://127.0.0.1:9999/axios-failed')
  }

  retryTimes = 2
  return axios.get('http://127.0.0.1:9999/axios-success')
}

export const req4 = params =>
  axios.post('http://127.0.0.1:9999/post-axios-success', {
    params,
  })
