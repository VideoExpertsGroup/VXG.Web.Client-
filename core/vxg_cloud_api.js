/* ATTENTION: Do not edit this file for no good reason!!!. This is a kernel file, and the performance of the entire system depends on its contents. */

window.vxg = window.vxg || {};
vxg.api = vxg.api || {};
vxg.api.cloud = vxg.api.cloud || {};
vxg.api.cloud.licenseKey = vxg.api.cloud.licenseKey || '';
vxg.api.cloud.allCamsToken = vxg.api.cloud.allCamsToken || '';
vxg.api.cloud.apiSrc = vxg.api.cloud.apiSrc || 'https://web.skyvr.videoexpertsgroup.com';

vxg.api.cloud.setAllCamsToken = function (token){
    vxg.api.cloud.allCamsToken = token;
}

vxg.api.cloud.setLicenseKey = function (key){
    vxg.api.cloud.licenseKey = key;
}

vxg.api.cloud.getBaseURLFromToken = function(access_token) {
    let _at;
    try{
    _at = JSON.parse(atob(access_token));
    } catch(e){};
    if (!_at) return '';
    let _url = _at['api'] ? _at['api'] : vxg.api.cloud.apiSrc;
    if (_url === vxg.api.cloud.apiSrc) {
        return _url;
    }
    let port = location.protocol=='https:' ? (_at['api_sp'] ? ':' + _at['api_sp'] : "") : (_at['api_p'] ? ':' + _at['api_p'] : "");
    return (location.protocol=='file:'?'https:':location.protocol)+"//" + _url + port +(_at['path']?'/'+_at['path']:'');
};

vxg.api.cloud.getChannelIdFromToken = function(access_token) {
    let _at;
    try{_at = JSON.parse(atob(access_token));} 
    catch(e){};
    if (!_at) return 0;
    if (_at['camid']!==undefined)
        return _at['camid'];
    return 0;
};

vxg.api.cloud.isSharedToken = function(access_token) {
    let _at;
    try{_at = JSON.parse(atob(access_token));} 
    catch(e){};
    if (!_at) return false;
    if (_at['camid']===undefined && _at['token']!==undefined)
        return true;
    return false;
};

vxg.api.cloud.isTokenRW = function(access_token) {
    let _at;
    try{_at = JSON.parse(atob(access_token));} 
    catch(e){};
    if (!_at) return false;
    if (_at['access']===undefined && _at['access'].indexOf('all')!==-1)
        return true;
    return false;
};

vxg.api.cloud.getHeader = function(channel_access_token) {
    let headers = {};
    if (vxg.api.cloud.isSharedToken(channel_access_token))
        headers['Authorization'] = 'SI ' + channel_access_token;
    else if (channel_access_token)
        headers['Authorization'] = 'Acc ' + channel_access_token;
    else if (vxg.api.cloud.allCamsToken){
        if (vxg.api.cloud.isSharedToken(vxg.api.cloud.allCamsToken))
            headers['Authorization'] = 'SI ' + vxg.api.cloud.allCamsToken;
        else
            headers['Authorization'] = 'Acc ' + vxg.api.cloud.allCamsToken;
    }else if (vxg.api.cloud.licenseKey)
        headers['Authorization'] = 'LKey ' + vxg.api.cloud.licenseKey;
    else {
        console.log('No token for access');
        return false;
    }
    return headers;
}

/** Get video camera settings - resolution, framerate etc. 
 *
 * @param channel_id integer Channel ID
 * @param channel_access_token string Channel access token or undefined
 * @return Promise
 */
vxg.api.cloud.getCameraSettings = function (channel_id, channel_access_token) {
    channel_id = parseInt(channel_id);
    if (channel_id<=0)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('Invalid channel id');}, 0);});
    let baseurl = vxg.api.cloud.getBaseURLFromToken(channel_access_token);
    let headers = vxg.api.cloud.getHeader(channel_access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});

    return $.ajax({
        type: 'GET',
        url: baseurl + '/api/v2/cameras/'+channel_id+'/media_streams/',
        contentType: "application/json",
        headers: headers,
    }).then(function(r){
        if (!r.rec_ms_id) return;
        vsid='';
        for (i in r.mstreams_supported)
            if (r.mstreams_supported[i].id==r.rec_ms_id)
                vsid = r.mstreams_supported[i].vs_id;
        if (!vsid)
            return new Promise(function(resolve, reject){
                setTimeout(function(){reject('No vsid');}, 0);
                console.log('No vsid');
            });
        return $.ajax({
            type: 'GET',
            url: baseurl + '/api/v2/cameras/'+channel_id+'/video/streams/'+vsid+'/',
            contentType: "application/json",
            headers: headers
        }).then(function (vs) {
            var ret = {
                ...r,
                ...vs
            };

            return ret;
        });
    });
};

/** Get video camera settings - resolution, framerate etc. 
 *
 * @param channel_id integer Channel ID
 * @param channel_access_token string Channel access token or undefined
 * @param data object Channel settings
 * @return Promise
 */
vxg.api.cloud.setCameraSettings = function (channel_id, channel_access_token, data) {
    channel_id = parseInt(channel_id);
    if (channel_id<=0)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('Invalid channel id');}, 0);});
    let headers = vxg.api.cloud.getHeader(channel_access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});

    return $.ajax({
        type: 'PUT',
        url: vxg.api.cloud.getBaseURLFromToken(channel_access_token) + '/api/v2/cameras/'+channel_id+'/video/streams/'+data.id+'/',
        contentType: "application/json",
        headers: headers,
        data: JSON.stringify(data)
    });
};

/** Get video stream settings for specified stream - resolution, framerate etc. 
 *
 * @param channel_id integer Channel ID
 * @param vsid string video stream id
 * @param channel_access_token string Channel access token or undefined
 * @return Promise
 */
vxg.api.cloud.getVideoStreamSettings = function(channel_id, vsid, channel_access_token) {
    channel_id = parseInt(channel_id);
    if (channel_id<=0)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('Invalid channel id');}, 0);});
    let baseurl = vxg.api.cloud.getBaseURLFromToken(channel_access_token);
    let headers = vxg.api.cloud.getHeader(channel_access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});

    return $.ajax({
        type: 'GET',
        url: baseurl + '/api/v2/cameras/'+channel_id+'/video/streams/'+vsid+'/',
        contentType: "application/json",
        headers: headers
    });
}

vxg.api.cloud.getNonJpegStreams = function(channel_id, channel_access_token) {
    channel_id = parseInt(channel_id);
    if (channel_id<=0)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('Invalid channel id');}, 0);});
    let baseurl = vxg.api.cloud.getBaseURLFromToken(channel_access_token);
    let headers = vxg.api.cloud.getHeader(channel_access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});

    return $.ajax({
        type: 'GET',
        url: baseurl + '/api/v2/cameras/'+channel_id+'/video/streams/',
        contentType: "application/json",
        headers: headers
    }).then(function(vs) {
        var validStreamIds = [];
        vs.objects.forEach(stream => {
            if (stream.format && stream.format.toLowerCase() != "jpeg" && stream.format.toLowerCase() != "mjpeg") {
                validStreamIds.push(stream.id);
            }
        })
        return validStreamIds;
    });
}

/** Set media streams for camera - live_ms_id, rec_ms_id
 *
 * @param channel_id integer Channel ID
 * @param channel_access_token string Channel access token or undefined
 * @param data object Channel settings
 * @return Promise
 */
vxg.api.cloud.setCameraStreams = function(channel_id, channel_access_token, data) {
    channel_id = parseInt(channel_id);
    if (channel_id<=0)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('Invalid channel id');}, 0);});
    let headers = vxg.api.cloud.getHeader(channel_access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});

    return $.ajax({
        type: 'PUT',
        url: vxg.api.cloud.getBaseURLFromToken(channel_access_token) + '/api/v2/cameras/'+channel_id+'/media_streams/',
        contentType: "application/json",
        headers: headers,
        data: JSON.stringify(data)
    });
}

/** Set camera meta
 *
 * @param channel_id integer Channel ID
 * @param channel_access_token string Channel access token or undefined
 * @param data object Channel meta
 * @return Promise
 */
vxg.api.cloud.saveUserMeta = function (channel_access_token, data) {
    let headers = vxg.api.cloud.getHeader(channel_access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});

    return $.ajax({
        type: 'POST',
        url: vxg.api.cloud.getBaseURLFromToken(channel_access_token) + '/api/v4/meta/',
        contentType: "application/json",
        headers: headers,
        data: JSON.stringify(data)
    });
};

vxg.api.cloud.deleteUserMeta = function (channel_access_token, metaid) {
    let headers = vxg.api.cloud.getHeader(channel_access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});

    return $.ajax({
        type: 'DELETE',
        url: vxg.api.cloud.getBaseURLFromToken(channel_access_token) + '/api/v4/meta/',
        contentType: "application/json",
        headers: headers,
        data: JSON.stringify([{id: metaid}])
    });
};

vxg.api.cloud.getUserMeta = function (channel_access_token, data) {
    let headers = vxg.api.cloud.getHeader(channel_access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});

    return $.ajax({
        type: 'POST',
        url: vxg.api.cloud.getBaseURLFromToken(channel_access_token) + '/api/v4/meta/filter/',
        contentType: "application/json",
        headers: headers,
        data: JSON.stringify(data)
    });
};

vxg.api.cloud.getAIEnabledCameras = function (channel_ids) {
    return vxg.user.getToken().then(function(r){
        let data={token:r,camera_list:channel_ids};
        return $.ajax({
            type: 'POST',
            url: vxg.api.cloudone.apiSrc+'/api/v1/user/camera/ai/get_config/',
            contentType: "application/json",
            data: JSON.stringify(data)
        });
    });
}


vxg.api.cloud.getUplinkUrl = function(camid, camurl) {
    var data = {"camid": camid, "url": camurl.replace("/uplink_camera/", "/api/device/" + camid)}
    
    return vxg.user.getToken().then(function(r){
        data.token = r;
        return $.ajax({
            type: 'POST',
            url: vxg.api.cloudone.apiSrc+'/api/v1/user/uplink_config/',
            contentType: "application/json",
            data: JSON.stringify(data)
        });
    });
}

/** Get channel preview image
 *
 * @return Promise
 */
vxg.api.cloud.getPreview = function(channel_access_token){
    let headers = vxg.api.cloud.getHeader(channel_access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});
    return $.ajax({
        type: 'GET',
        url: vxg.api.cloud.getBaseURLFromToken(channel_access_token) + '/api/v4/live/image/',
        contentType: "application/json",
        cache: true,
        headers: headers
    });
};

/** Get motion detection info - grid width and height
 *
 * @param channel_id_or_access_token string Channel access token or channel id
 * @return Promise
 */
vxg.api.cloud.getCameraMotionDetection = function(channel_id_or_access_token) {
    let channel_id=parseInt(channel_id_or_access_token);
    let channel_access_token;
    if (isNaN(channel_id) || channel_id<=0)
        channel_id = vxg.api.cloud.getChannelIdFromToken(channel_id_or_access_token);
    if (typeof channel_id_or_access_token === "string")
        channel_access_token = channel_id_or_access_token;
    if (channel_id<1)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No channel id');}, 0);});
    let headers = vxg.api.cloud.getHeader(channel_access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});
    return $.ajax({
        type: 'GET',
        url: vxg.api.cloud.getBaseURLFromToken(channel_access_token) + '/api/v2/cameras/'+channel_id+'/motion_detection/',
        headers: headers,
        contentType: "application/json"
    });
};

/** Get motion detection region - grid array
 *
 * @param channel_id_or_access_token string Channel access token or channel id
 * @return Promise
 */
vxg.api.cloud.getCameraMotionDetectionRegions = function(channel_id_or_access_token) {
    let channel_id=parseInt(channel_id_or_access_token);
    let channel_access_token;
    if (isNaN(channel_id) || channel_id<=0)
        channel_id = vxg.api.cloud.getChannelIdFromToken(channel_id_or_access_token);
    if (typeof channel_id_or_access_token === "string")
        channel_access_token = channel_id_or_access_token;
    if (channel_id<1)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No channel id');}, 0);});
    let headers = vxg.api.cloud.getHeader(channel_access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});
    return $.ajax({
        type: 'GET',
        url: vxg.api.cloud.getBaseURLFromToken(channel_access_token) + '/api/v2/cameras/'+channel_id+'/motion_detection/regions/',
        headers: headers,
        contentType: "application/json"
    });
};

/** Get motion detection region - grid array
 *
 * @param region string Region in base64
 * @param channel_id_or_access_token string Channel access token or channel id
 * @return Promise
 */
vxg.api.cloud.setCameraMotionDetectionRegions = function(regions, channel_id_or_access_token) {
    let channel_id=parseInt(channel_id_or_access_token);
    let channel_access_token;
    if (isNaN(channel_id) || channel_id<=0)
        channel_id = vxg.api.cloud.getChannelIdFromToken(channel_id_or_access_token);
    if (typeof channel_id_or_access_token === "string")
        channel_access_token = channel_id_or_access_token;
    if (channel_id<1)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No channel id');}, 0);});
    let headers = vxg.api.cloud.getHeader(channel_access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});

    let args = {objects: (regions || {})};
    return $.ajax({
        type: 'PUT',
        url: vxg.api.cloud.getBaseURLFromToken(channel_access_token) + '/api/v2/cameras/'+channel_id+'/motion_detection/regions/',
        headers: headers,
        contentType: "application/json",
        data: JSON.stringify(args)
    });
};

vxg.api.cloud.getCamerasListV2 = function(access_token, limit, offset, args) {
    let headers = vxg.api.cloud.getHeader(access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});
    return $.ajax({
        type: 'GET',
        url: vxg.api.cloud.getBaseURLFromToken(access_token) + '/api/v2/cameras/',
        headers: headers,
        contentType: "application/json",
        data: args
    });
};

vxg.api.cloud.getLocations = function(access_token) {
    let headers = vxg.api.cloud.getHeader(access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});
    return $.ajax({
        type: 'GET',
        url: vxg.api.cloud.getBaseURLFromToken(access_token) + '/api/v2/cameras/meta/get_values/location/',
        headers: headers,
        contentType: "application/json"
    });
};

/** Get events list
 *
 * @param channel_id_or_access_token string Channel access token or channel id
 * @param limit integer Max count of items in result
 * @param offset integer Offset of items in result
 * @param type string Type of event
 * @param starttime string
 * @param endtime string
 * @return Promise
 */
vxg.api.cloud.getEventslist = function(access_token, limit, offset, args = undefined,  type, starttime, endtime) {
    let headers = vxg.api.cloud.getHeader(access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});

    if (args === undefined) {
        args={'include_filemeta_download':true,'include_meta':true,'order_by':'-time'};
    }
    
    if (limit!==undefined) args['limit'] = limit;
    if (offset!==undefined) args['offset'] = offset;
    if (type!==undefined) args['events'] = type;
    if (starttime!==undefined) args['start'] = starttime;
    if (endtime!==undefined) args['end'] = endtime;
	
    return $.ajax({
        type: 'GET',
        url: vxg.api.cloud.getBaseURLFromToken(access_token) + '/api/v2/storage/events/',
        headers: headers,
        contentType: "application/json",
        data: args
    });
};

/** Get event info
 *
 * @param event_id integer Event ID
 * @param access_token string Access token
 * @return Promise
 */
vxg.api.cloud.getEventByID = function(eventid, access_token) {
    let headers = vxg.api.cloud.getHeader(access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});
    return $.ajax({
        type: 'GET',
        url: vxg.api.cloud.getBaseURLFromToken(access_token) + '/api/v2/storage/events/'+eventid+'/',
        headers: headers,
        contentType: "application/json",
        data:{'include_filemeta_download':true,'include_meta':true,'order_by':'-time'}
    });
}

vxg.api.cloud.getGroupTokenInfo = function(token){
    let headers = vxg.api.cloud.getHeader(token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});
    return $.ajax({
        type: 'GET',
        url: vxg.api.cloud.apiSrc + '/api/v5/meta/',
        headers: headers,
        contentType: "application/json"
    });
};

vxg.api.cloud.getCamerasList = function(obj){
    var data = obj || {};
    let headers = vxg.api.cloud.getHeader();
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});
    data['include_meta']=true;

    return $.ajax({
        type: 'GET',
        url: vxg.api.cloud.apiSrc + '/api/v5/channels/',
        headers: headers,
        contentType: "application/json",
        data: data
    }).then(function(r){
        let ret = r;
        if (!ret.objects || ret.objects.length<1) return ret;
        ret.objects.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        if (ret.objects[0]['name']) return ret;
        return $.ajax({
            type: 'GET',
            url: vxg.api.cloud.apiSrc + '/api/v2/cameras/',
            headers: headers,
            contentType: "application/json",
            data: {limit:obj.limit,offset:obj.offset,include_meta:true}
        }).then(function(r){
            if (!r.objects || r.objects.length<0) return r;
            for (let i=0; i<ret.objects.length; i++){
                for (let j=0; j<r.objects.length; j++){
                    if (ret.objects[i]['id']!=r.objects[j]['id']) continue;
                    ret.objects[i]['name'] = r.objects[j]['name'];
                    break;
                }
            }
            ret.objects.sort((a, b) => parseInt(a.id) - parseInt(b.id));
            return new Promise(function(resolve, reject){setTimeout(function(){resolve(ret);}, 0);});
        });
    });
};

vxg.api.cloud.getCameraInfo = function(channel_id, access_token, obj){
    var data = obj || {};
    data.include_meta = obj && obj.include_meta ? obj.include_meta : true;

    let headers = vxg.api.cloud.getHeader(access_token);
    if (!access_token) return $.ajax({
        type: 'GET',
        url: vxg.api.cloud.apiSrc + '/api/v5/channels/'+channel_id+'/',
        headers: headers,
        contentType: "application/json",
        data: data
    });
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});

    return $.ajax({
        type: 'GET',
        url: vxg.api.cloud.apiSrc + '/api/v4/channel/',
        headers: headers,
        contentType: "application/json",
        data: data
    });
};

vxg.api.cloud.getCameraConfig = function(channel_id, access_token){
    var data = {detail:'detail', include_meta:true};
    let headers = vxg.api.cloud.getHeader(access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});

    return $.ajax({
        type: 'GET',
        url: vxg.api.cloud.apiSrc + '/api/v2/cameras/' + channel_id + '/',
        headers: headers,
        contentType: "application/json",
        data: data
    });
}

vxg.api.cloud.updateCameraConfig = function(channel_id, access_token, config){
    var data = config;
    let timezone = data.timezone; delete config.timezone;
    let headers = vxg.api.cloud.getHeader(access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});

    return $.ajax({
        type: 'PUT',
        url: vxg.api.cloud.apiSrc + '/api/v2/cameras/' + channel_id + '/',
        headers: headers,
        contentType: "application/json",
        data: JSON.stringify(data)
    }).then(function(r){
        let ret = r;
        if (!timezone) return ret;
        return vxg.api.cloud.updateCameraTimezone(r.cmngrid, access_token,timezone).then(function(){
            return ret;
        });
    });
}

vxg.api.cloud.updateCameraTimezone = function(channel_id, access_token, timezone){
    var data = {timezone:timezone};
    let headers = vxg.api.cloud.getHeader(access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});

    return $.ajax({
        type: 'PUT',
        url: vxg.api.cloud.apiSrc + '/api/v2/cmngrs/' + channel_id + '/',
        headers: headers,
        contentType: "application/json",
        data: JSON.stringify(data)
    });
}


vxg.api.cloud.getClipslist = function(access_token, limit, offset, args = undefined) {
    let headers = vxg.api.cloud.getHeader(access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});

    if (args === undefined) {
        args={'order_by':'-created'}; //created: ascending order of creation time;-created: descending order;event_time: ascending order of event_time;-event_time: descending order.
    }
    
    if (limit!==undefined) args['limit'] = limit;
    if (offset!==undefined) args['offset'] = offset;
	
    return $.ajax({
        type: 'GET',
        url: vxg.api.cloud.getBaseURLFromToken(access_token) + '/api/v2/storage/clips/',
        headers: headers,
        contentType: "application/json",
        data: args
    });
};

vxg.api.cloud.deleteClipV2 = function (access_token, clipid) {
    let headers = vxg.api.cloud.getHeader(access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});
    
    return $.ajax({
        type: 'DELETE',
        url: vxg.api.cloud.getBaseURLFromToken(access_token) + '/api/v2/storage/clips/' + clipid + '/',
        headers: headers,
        contentType: "application/json",
    });
}

vxg.api.cloud.deleteClip = function (access_token, clipid) {
    let headers = vxg.api.cloud.getHeader(access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});
    
    return $.ajax({
        type: 'DELETE',
        url: vxg.api.cloud.getBaseURLFromToken(access_token) + '/api/v4/clips/' + clipid + '/',
        headers: headers,
        contentType: "application/json",
    });
}

vxg.api.cloud.createClip = function( source_camid, camid, start, end, title, delete_at, access_token) {
    let headers = vxg.api.cloud.getHeader(access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});
    let args = {camid: camid, delete_at: delete_at, end: end, start: start, title: title, wait_for_data: true};
    if (source_camid!==undefined) args.source_camid = source_camid;

    return $.ajax({
        type: 'POST',
        url: vxg.api.cloud.getBaseURLFromToken(access_token) + '/api/v2/storage/clips/',
        contentType: "application/json",
        headers: headers,
        data: JSON.stringify(args)
    });
};

vxg.api.cloud.getClip = function( access_token, clipid) {
    let headers = vxg.api.cloud.getHeader(access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});
    return $.ajax({
        type: 'GET',
        url: vxg.api.cloud.getBaseURLFromToken(access_token) + '/api/v2/storage/clips/' + clipid + '/',
        contentType: "application/json",
        headers: headers
    });
};

vxg.api.cloud.shareClip = function ( access_token, clipid, expire) {
    let headers = vxg.api.cloud.getHeader(access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});
    
    args = {};
    args.expire = expire;
    
    return $.ajax({
        type: 'POST',
        url: vxg.api.cloud.getBaseURLFromToken(access_token) + '/api/v2/storage/clips/' + clipid + '/sharings/',
        headers: headers,
        contentType: "application/json",
        data: JSON.stringify(args)
    });
}

vxg.api.cloud.createClipMeta = function(access_token, clipid, notes, timestamp, clipname, clipcase, clipincident) {
    let headers = vxg.api.cloud.getHeader(access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});

    args = {};
    args.timestamp = timestamp;
    args.long = {'clip_id': Number(clipid)};
    if (clipincident !== undefined) {
	args.long.incident = Number(clipincident);
    }
    args.string = {'type':'clip', 'description': String(notes) };
    if (clipname !== undefined) {
	args.string.clipname = clipname;
    }
    if (clipcase !== undefined) {
	args.string.clipcase = clipcase;
    }

    return $.ajax({
        type: 'POST',
        url: vxg.api.cloud.getBaseURLFromToken(access_token) + '/api/v4/meta/',
        headers: headers,
        contentType: "application/json",
        data: JSON.stringify([args])
    });
};

vxg.api.cloud.getClipMeta = function(access_token, clipid) {
    let headers = vxg.api.cloud.getHeader(access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});

    var sort = []; sort.push("-timestamp");
    var and  = []; var andel = {}; andel.field = "long.clip_id"; andel.eq= Number(clipid); and.push(andel);
    var args = {};
    args.limit  = 1;
    args.sort = sort;
    args.filter = {};
    args.filter.and = and;

    return $.ajax({
        type: 'POST',
        url: vxg.api.cloud.getBaseURLFromToken(access_token) + '/api/v4/meta/filter/',
        headers: headers,
        contentType: "application/json",
        data: JSON.stringify(args)
    });
};

vxg.api.cloud.updateClipMeta = function(access_token, id, notes, clipname, clipcase, clipincident ) {
    let headers = vxg.api.cloud.getHeader(access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});

    args = {};
    args.id =  id;
    args.string = {'description': String(notes) };
    if (clipname !== undefined) {
	args.string.clipname = clipname;
    }
    if (clipcase !== undefined) {
	args.string.clipcase = clipcase;
    }
    if (clipincident !== undefined) {
	args.long = {};
	args.long.incident = Number(clipincident);
    }


    return $.ajax({
        type: 'PUT',
        url: vxg.api.cloud.getBaseURLFromToken(access_token) + '/api/v4/meta/',
        headers: headers,
        contentType: "application/json",
        data: JSON.stringify([args])
    });
};

vxg.api.cloud.getClipsIdByMeta = function(access_token, searchword) {
    let headers = vxg.api.cloud.getHeader(access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});

    var sort = []; sort.push("-timestamp");
    var or  = []; 
	var or_el = {}; or_el.field = "string.description"; or_el.eq = searchword ; or.push(or_el);
	or_el = {}; or_el.field = "string.clipcase"; or_el.eq = searchword ; or.push(or_el);
	or_el = {}; or_el.field = "string.clipname"; or_el.eq = searchword ; or.push(or_el);
    var args = {};
    
    args.sort = sort;
    args.filter = {};
    args.filter.or = or;

    return $.ajax({
        type: 'POST',
        url: vxg.api.cloud.getBaseURLFromToken(access_token) + '/api/v2/storage/meta/filter/',
        headers: headers,
        contentType: "application/json",
        data: JSON.stringify(args)
    });
}

vxg.api.cloud.getClipsByIdSet = function(access_token, ids) {
    let headers = vxg.api.cloud.getHeader(access_token);
    if (!headers)
        return new Promise(function(resolve, reject){setTimeout(function(){reject('No token for access');}, 0);});

    return $.ajax({
        type: 'GET',
        url: vxg.api.cloud.getBaseURLFromToken(access_token) + '/api/v2/storage/clips/?ids=' + ids,
        headers: headers,
        contentType: "application/json"
    });
}


vxg.api.cloud.resolverService = function(serialnumber, password, token) {
    return $.ajax({
        type: 'PUT',
        url: window.CAMERA_RESOLVER_SERVICE || 'https://camera.vxg.io/v1/token',
        contentType: "application/json",
        data: JSON.stringify({serial_id:serialnumber, password:password, access_token:token})
    });
};

