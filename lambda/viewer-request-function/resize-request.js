const dimensions = {
    '1600x900':  [{ w: 1600, h: 900},  { w: 800, h: 450}, { w: 400, h: 225}], // 16:9
    '1600x1100': [{ w: 1600, h: 1100}, { w: 800, h: 550}, { w: 400, h: 275}], //16:10
    '1920x1080': [{ w: 1096, h: 616},  { w: 393, h: 231}, { w: 189, h: 162}], // curzon landscape
    '2100x900': [{ w: 2100, h: 900},   {w: 1050, h: 450}, { w:525, h: 225}] // 21:9
};

const W_PARAM_PATTERN = /(\?|&)w=(\d+)($|&)/i;
const EXT_PATTERN = /\.(jpg|jpeg|png|gif|webp)/i;
const PATH_SIZE_PATTERN = /\/(\d+x\d+)\//i;
const QUERYSTRING_PATTERN = /^(.*?)\?(.*)/i;

class ResizeRequest {
    constructor(request){
        this.request = request;
        this.isValid = () => !!this.w && !!this.size;

        if (!request || !request.uri){ return; }

        let url = request.uri;

        // check for image file extension
        if (!url.match(EXT_PATTERN)){ return; }

        // check for `w` querystring param
        let matches = url.match(W_PARAM_PATTERN);
        if (!matches) {return; }
        this.w = Number(matches[2]);
        this.querystring = url.match(QUERYSTRING_PATTERN)[2];

        // check for `/wxh/` in path
        matches = url.match(PATH_SIZE_PATTERN);
        if (!matches){ return; }
        this.size = matches[1];
    }

    decorateRequest(){
        let best = this.findBestSize();

        // remove query string references
        if(this.querystring){
            this.request.uri = this.request.uri.replace('?' + this.querystring, '');
            if(this.request.headers.querystring){this.request.headers.querystring = "";}
            if(this.request.querystring){this.request.querystring = "";}
        }

        if (best){
            let newSize = `${best.w}x${best.h}`;
            // insert new size AFTER original size in path
            this.request.uri = this.request.uri.replace(`/${this.size}/`, `/${this.size}+${newSize}/`);
        }

        return this.request;
    }

    findBestSize(){
        if (!this.isValid()) { return; }

        let sizes = dimensions[this.size];
        if (!sizes || !sizes.length) { return; }

        // we want the smallest size image that is larger than the requested width
        // if we can't find one then we dont do any resizing.
        let found =  sizes.filter(res => res.w > this.w).sort((a, b) => a.w - b.w)[0];
        if (!found) {return; }

        // if its same the same as the original, then pretend we didnt find one
        return this.size === `${found.w}x${found.h}` ? undefined : found;
    }
}

module.exports = ResizeRequest;