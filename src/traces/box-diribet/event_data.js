'use strict';


module.exports = function eventData(out, pt) {
	if (pt.outliersMark != null)
		out.outliersMark = pt.outliersMark;
	
    out.x = pt.xVal;
    out.y = pt.yVal;
    out.xaxis = pt.xa;
    out.yaxis = pt.ya;

    return out;
};
