function randomNum(freeList){
var n = Math.floor(Math.random() * freeList.length)
return n
}




exports.find=function (me,selflist,otherlist){
  if(otherlist.length>0){
	return otherlist[randomNum(otherlist)];
  }
  if(otherlist.length==0){
      if(selflist.length>1)
	return selflist[randomNum(selflist)];
      else
	return me
  }


}
