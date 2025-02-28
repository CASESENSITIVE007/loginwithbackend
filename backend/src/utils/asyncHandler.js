const asyncHandler =(requestHandler)=> async(req,res,next)=>{
    try {
       return  await  requestHandler(req,res,next )
    } catch (error) {
        res.status(error.code || 500).json({
            success:false,
            message:error.message
        })
    }
}

export {asyncHandler}

// ye hamne isliye bnaya hai taki hm brr brr database se connect krne ke liye same code brr brr na likhien
// to hm yha 1 method define kr denge jismai koi bhi function pss hoga or wo chal jayga  