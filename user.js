class user {
  constructor(username, _id) {
    this.username = username 
    this._id = _id
    this.log=[]
  }

  getCount(){
    return this.log.length;
  }
}

module.exports=user