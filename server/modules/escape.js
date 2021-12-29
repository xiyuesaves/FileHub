// 解码
const decode = (str) => {
  if (str) {
    try {
      return decodeURI(str).replace(/%25|%23/g, str => {
        switch (str) {
          case "%25":
            return "%";
          case "%23":
            return "#";
          default:
            return str;
        }
      })
    } catch (err) {
      return str.replace(/%25|%23/g, str => {
        switch (str) {
          case "%25":
            return "%";
          case "%23":
            return "#";
          default:
            return str;
        }
      })
    }
  } else {
    return str;
  }
}

// 编码函数
const encode = (str) => {
  if (str) {
    return encodeURI(str).replace(/#/g, str => {
      switch (str) {
        case "%":
          return "%25";
        case "#":
          return "%23";
        default:
          return str;
      }
    })
  } else {
    return str;
  }
}

module.exports = { decode, encode }
