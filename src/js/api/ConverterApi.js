const converter_app_url = process.env.CONVERTER_APP_URL

class ConverterApi {

  static fetchTables(file) {
    const data = new FormData()
    data.append('file', file)

    const requestOptions = {
      method: 'POST',
      body: data
    }

    let ok
    return fetch(converter_app_url + '/tables', requestOptions)
      .then(response => {
        ok = response.ok
        return response.json()
      })
      .then(data => {
        if (ok) {
          return data
        } else {
          throw new Error(json.error)
        }
      })
  }

  static createProfile(data) {
    const requestOptions = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    }

    let ok
    return fetch(converter_app_url + '/profiles', requestOptions)
      .then(response => {
        ok = response.ok
        return response.json()
      })
      .then(data => {
        if (ok) {
          return data
        } else {
          throw new Error(json.error)
        }
      })
  }

  static fetchConversion(file, fileName) {
    const data = new FormData()
    data.append('file', file)

    const requestOptions = {
      method: 'POST',
      body: data
    }

    return fetch(converter_app_url + '/api/v1/conversions', requestOptions)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName

        document.body.appendChild(a)
        a.click()
        a.remove()
      })
  }
}

export default ConverterApi
