import{D as Le,C as j,N as Ne}from"./index-DMViwzbK.js";import{d as Be}from"./TextureUtils-CNyBHDvb.js";/*!
fflate - fast JavaScript compression/decompression
<https://101arrowz.github.io/fflate>
Licensed under MIT. https://github.com/101arrowz/fflate/blob/master/LICENSE
version 0.8.2
*/var C=Uint8Array,U=Uint16Array,pe=Int32Array,ge=new C([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),de=new C([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),ye=new C([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),Pe=function(e,n){for(var t=new U(31),r=0;r<31;++r)t[r]=n+=1<<e[r-1];for(var o=new pe(t[30]),r=1;r<30;++r)for(var a=t[r];a<t[r+1];++a)o[a]=a-t[r]<<5|r;return{b:t,r:o}},ke=Pe(ge,2),Ve=ke.b,fe=ke.r;Ve[28]=258,fe[258]=28;var be=Pe(de,0),me=be.r,le=new U(32768);for(var M=0;M<32768;++M){var V=(M&43690)>>1|(M&21845)<<1;V=(V&52428)>>2|(V&13107)<<2,V=(V&61680)>>4|(V&3855)<<4,le[M]=((V&65280)>>8|(V&255)<<8)>>1}var Q=function(e,n,t){for(var r=e.length,o=0,a=new U(n);o<r;++o)e[o]&&++a[e[o]-1];var s=new U(n);for(o=1;o<n;++o)s[o]=s[o-1]+a[o-1]<<1;var f;if(t){f=new U(1<<n);var u=15-n;for(o=0;o<r;++o)if(e[o])for(var c=o<<4|e[o],i=n-e[o],l=s[e[o]-1]++<<i,h=l|(1<<i)-1;l<=h;++l)f[le[l]>>u]=c}else for(f=new U(r),o=0;o<r;++o)e[o]&&(f[o]=le[s[e[o]-1]++]>>15-e[o]);return f},b=new C(288);for(var M=0;M<144;++M)b[M]=8;for(var M=144;M<256;++M)b[M]=9;for(var M=256;M<280;++M)b[M]=7;for(var M=280;M<288;++M)b[M]=8;var ne=new C(32);for(var M=0;M<32;++M)ne[M]=5;var We=Q(b,9,0),Ge=Q(ne,5,0),Re=function(e){return(e+7)/8|0},Ue=function(e,n,t){return(t==null||t>e.length)&&(t=e.length),new C(e.subarray(n,t))},Xe=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],te=function(e,n,t){var r=new Error(n||Xe[e]);if(r.code=e,Error.captureStackTrace&&Error.captureStackTrace(r,te),!t)throw r;return r},N=function(e,n,t){t<<=n&7;var r=n/8|0;e[r]|=t,e[r+1]|=t>>8},J=function(e,n,t){t<<=n&7;var r=n/8|0;e[r]|=t,e[r+1]|=t>>8,e[r+2]|=t>>16},ue=function(e,n){for(var t=[],r=0;r<e.length;++r)e[r]&&t.push({s:r,f:e[r]});var o=t.length,a=t.slice();if(!o)return{t:De,l:0};if(o==1){var s=new C(t[0].s+1);return s[t[0].s]=1,{t:s,l:1}}t.sort(function(A,P){return A.f-P.f}),t.push({s:-1,f:25001});var f=t[0],u=t[1],c=0,i=1,l=2;for(t[0]={s:-1,f:f.f+u.f,l:f,r:u};i!=o-1;)f=t[t[c].f<t[l].f?c++:l++],u=t[c!=i&&t[c].f<t[l].f?c++:l++],t[i++]={s:-1,f:f.f+u.f,l:f,r:u};for(var h=a[0].s,r=1;r<o;++r)a[r].s>h&&(h=a[r].s);var v=new U(h+1),g=ce(t[i-1],v,0);if(g>n){var r=0,$=0,w=g-n,E=1<<w;for(a.sort(function(P,x){return v[x.s]-v[P.s]||P.f-x.f});r<o;++r){var O=a[r].s;if(v[O]>n)$+=E-(1<<g-v[O]),v[O]=n;else break}for($>>=w;$>0;){var z=a[r].s;v[z]<n?$-=1<<n-v[z]++-1:++r}for(;r>=0&&$;--r){var y=a[r].s;v[y]==n&&(--v[y],++$)}g=n}return{t:new C(v),l:g}},ce=function(e,n,t){return e.s==-1?Math.max(ce(e.l,n,t+1),ce(e.r,n,t+1)):n[e.s]=t},Se=function(e){for(var n=e.length;n&&!e[--n];);for(var t=new U(++n),r=0,o=e[0],a=1,s=function(u){t[r++]=u},f=1;f<=n;++f)if(e[f]==o&&f!=n)++a;else{if(!o&&a>2){for(;a>138;a-=138)s(32754);a>2&&(s(a>10?a-11<<5|28690:a-3<<5|12305),a=0)}else if(a>3){for(s(o),--a;a>6;a-=6)s(8304);a>2&&(s(a-3<<5|8208),a=0)}for(;a--;)s(o);a=1,o=e[f]}return{c:t.subarray(0,r),n}},K=function(e,n){for(var t=0,r=0;r<n.length;++r)t+=e[r]*n[r];return t},Oe=function(e,n,t){var r=t.length,o=Re(n+2);e[o]=r&255,e[o+1]=r>>8,e[o+2]=e[o]^255,e[o+3]=e[o+1]^255;for(var a=0;a<r;++a)e[o+a+4]=t[a];return(o+4+r)*8},_e=function(e,n,t,r,o,a,s,f,u,c,i){N(n,i++,t),++o[256];for(var l=ue(o,15),h=l.t,v=l.l,g=ue(a,15),$=g.t,w=g.l,E=Se(h),O=E.c,z=E.n,y=Se($),A=y.c,P=y.n,x=new U(19),d=0;d<O.length;++d)++x[O[d]&31];for(var d=0;d<A.length;++d)++x[A[d]&31];for(var p=ue(x,7),k=p.t,W=p.l,R=19;R>4&&!k[ye[R-1]];--R);var G=c+5<<3,D=K(o,b)+K(a,ne)+s,I=K(o,h)+K(a,$)+s+14+3*R+K(x,k)+2*x[16]+3*x[17]+7*x[18];if(u>=0&&G<=D&&G<=I)return Oe(n,i,e.subarray(u,u+c));var H,m,F,B;if(N(n,i,1+(I<D)),i+=2,I<D){H=Q(h,v,0),m=h,F=Q($,w,0),B=$;var oe=Q(k,W,0);N(n,i,z-257),N(n,i+5,P-1),N(n,i+10,R-4),i+=14;for(var d=0;d<R;++d)N(n,i+3*d,k[ye[d]]);i+=3*R;for(var Z=[O,A],q=0;q<2;++q)for(var X=Z[q],d=0;d<X.length;++d){var L=X[d]&31;N(n,i,oe[L]),i+=k[L],L>15&&(N(n,i,X[d]>>5&127),i+=X[d]>>12)}}else H=We,m=b,F=Ge,B=ne;for(var d=0;d<f;++d){var _=r[d];if(_>255){var L=_>>18&31;J(n,i,H[L+257]),i+=m[L+257],L>7&&(N(n,i,_>>23&31),i+=ge[L]);var Y=_&31;J(n,i,F[Y]),i+=B[Y],Y>3&&(J(n,i,_>>5&8191),i+=de[Y])}else J(n,i,H[_]),i+=m[_]}return J(n,i,H[256]),i+m[256]},Ye=new pe([65540,131080,131088,131104,262176,1048704,1048832,2114560,2117632]),De=new C(0),je=function(e,n,t,r,o,a){var s=a.z||e.length,f=new C(r+s+5*(1+Math.ceil(s/7e3))+o),u=f.subarray(r,f.length-o),c=a.l,i=(a.r||0)&7;if(n){i&&(u[0]=a.r>>3);for(var l=Ye[n-1],h=l>>13,v=l&8191,g=(1<<t)-1,$=a.p||new U(32768),w=a.h||new U(g+1),E=Math.ceil(t/3),O=2*E,z=function(ie){return(e[ie]^e[ie+1]<<E^e[ie+2]<<O)&g},y=new pe(25e3),A=new U(288),P=new U(32),x=0,d=0,p=a.i||0,k=0,W=a.w||0,R=0;p+2<s;++p){var G=z(p),D=p&32767,I=w[G];if($[D]=I,w[G]=D,W<=p){var H=s-p;if((x>7e3||k>24576)&&(H>423||!c)){i=_e(e,u,0,y,A,P,d,k,R,p-R,i),k=x=d=0,R=p;for(var m=0;m<286;++m)A[m]=0;for(var m=0;m<30;++m)P[m]=0}var F=2,B=0,oe=v,Z=D-I&32767;if(H>2&&G==z(p-Z))for(var q=Math.min(h,H)-1,X=Math.min(32767,p),L=Math.min(258,H);Z<=X&&--oe&&D!=I;){if(e[p+F]==e[p+F-Z]){for(var _=0;_<L&&e[p+_]==e[p+_-Z];++_);if(_>F){if(F=_,B=Z,_>q)break;for(var Y=Math.min(Z,_-2),$e=0,m=0;m<Y;++m){var ae=p-Z+m&32767,Ze=$[ae],Me=ae-Ze&32767;Me>$e&&($e=Me,I=ae)}}}D=I,I=$[D],Z+=D-I&32767}if(B){y[k++]=268435456|fe[F]<<18|me[B];var xe=fe[F]&31,we=me[B]&31;d+=ge[xe]+de[we],++A[257+xe],++P[we],W=p+F,++x}else y[k++]=e[p],++A[e[p]]}}for(p=Math.max(p,W);p<s;++p)y[k++]=e[p],++A[e[p]];i=_e(e,u,c,y,A,P,d,k,R,p-R,i),c||(a.r=i&7|u[i/8|0]<<3,i-=7,a.h=w,a.p=$,a.i=p,a.w=W)}else{for(var p=a.w||0;p<s+c;p+=65535){var se=p+65535;se>=s&&(u[i/8|0]=c,se=s),i=Oe(u,i+1,e.subarray(p,se))}a.i=s}return Ue(f,0,r+Re(i)+o)},qe=function(){for(var e=new Int32Array(256),n=0;n<256;++n){for(var t=n,r=9;--r;)t=(t&1&&-306674912)^t>>>1;e[n]=t}return e}(),Je=function(){var e=-1;return{p:function(n){for(var t=e,r=0;r<n.length;++r)t=qe[t&255^n[r]]^t>>>8;e=t},d:function(){return~e}}},Ke=function(e,n,t,r,o){if(!o&&(o={l:1},n.dictionary)){var a=n.dictionary.subarray(-32768),s=new C(a.length+e.length);s.set(a),s.set(e,a.length),e=s,o.w=a.length}return je(e,n.level==null?6:n.level,n.mem==null?o.l?Math.ceil(Math.max(8,Math.min(13,Math.log(e.length)))*1.5):20:12+n.mem,t,r,o)},Ie=function(e,n){var t={};for(var r in e)t[r]=e[r];for(var r in n)t[r]=n[r];return t},S=function(e,n,t){for(;t;++n)e[n]=t,t>>>=8};function Qe(e,n){return Ke(e,n||{},0,0)}var Fe=function(e,n,t,r){for(var o in e){var a=e[o],s=n+o,f=r;Array.isArray(a)&&(f=Ie(r,a[1]),a=a[0]),a instanceof C?t[s]=[a,f]:(t[s+="/"]=[new C(0),f],Fe(a,s,t,r))}},Te=typeof TextEncoder<"u"&&new TextEncoder,en=typeof TextDecoder<"u"&&new TextDecoder,nn=0;try{en.decode(De,{stream:!0}),nn=1}catch{}function re(e,n){var t;if(Te)return Te.encode(e);for(var r=e.length,o=new C(e.length+(e.length>>1)),a=0,s=function(c){o[a++]=c},t=0;t<r;++t){if(a+5>o.length){var f=new C(a+8+(r-t<<1));f.set(o),o=f}var u=e.charCodeAt(t);u<128||n?s(u):u<2048?(s(192|u>>6),s(128|u&63)):u>55295&&u<57344?(u=65536+(u&1047552)|e.charCodeAt(++t)&1023,s(240|u>>18),s(128|u>>12&63),s(128|u>>6&63),s(128|u&63)):(s(224|u>>12),s(128|u>>6&63),s(128|u&63))}return Ue(o,0,a)}var ve=function(e){var n=0;if(e)for(var t in e){var r=e[t].length;r>65535&&te(9),n+=r+4}return n},Ce=function(e,n,t,r,o,a,s,f){var u=r.length,c=t.extra,i=f&&f.length,l=ve(c);S(e,n,s!=null?33639248:67324752),n+=4,s!=null&&(e[n++]=20,e[n++]=t.os),e[n]=20,n+=2,e[n++]=t.flag<<1|(a<0&&8),e[n++]=o&&8,e[n++]=t.compression&255,e[n++]=t.compression>>8;var h=new Date(t.mtime==null?Date.now():t.mtime),v=h.getFullYear()-1980;if((v<0||v>119)&&te(10),S(e,n,v<<25|h.getMonth()+1<<21|h.getDate()<<16|h.getHours()<<11|h.getMinutes()<<5|h.getSeconds()>>1),n+=4,a!=-1&&(S(e,n,t.crc),S(e,n+4,a<0?-a-2:a),S(e,n+8,t.size)),S(e,n+12,u),S(e,n+14,l),n+=16,s!=null&&(S(e,n,i),S(e,n+6,t.attrs),S(e,n+10,s),n+=14),e.set(r,n),n+=u,l)for(var g in c){var $=c[g],w=$.length;S(e,n,+g),S(e,n+2,w),e.set($,n+4),n+=4+w}return i&&(e.set(f,n),n+=i),n},rn=function(e,n,t,r,o){S(e,n,101010256),S(e,n+8,t),S(e,n+10,t),S(e,n+12,r),S(e,n+16,o)};function tn(e,n){n||(n={});var t={},r=[];Fe(e,"",t,n);var o=0,a=0;for(var s in t){var f=t[s],u=f[0],c=f[1],i=c.level==0?0:8,l=re(s),h=l.length,v=c.comment,g=v&&re(v),$=g&&g.length,w=ve(c.extra);h>65535&&te(11);var E=i?Qe(u,c):u,O=E.length,z=Je();z.p(u),r.push(Ie(c,{size:u.length,crc:z.d(),c:E,f:l,m:g,u:h!=s.length||g&&v.length!=$,o,compression:i})),o+=30+h+w+O,a+=76+2*(h+w)+($||0)+O}for(var y=new C(a+22),A=o,P=a-o,x=0;x<r.length;++x){var l=r[x];Ce(y,l.o,l,l.f,l.u,l.c.length);var d=30+l.f.length+ve(l.extra);y.set(l.c,l.o+d),Ce(y,o,l,l.f,l.u,l.c.length,l.o,l.m),o+=16+d+(l.m?l.m.length:0)}return rn(y,o,r.length,P,A),y}class mn{parse(n,t,r,o){this.parseAsync(n,o).then(t).catch(r)}async parseAsync(n,t={}){t=Object.assign({ar:{anchoring:{type:"plane"},planeAnchoring:{alignment:"horizontal"}},includeAnchoringProperties:!0,quickLookCompatible:!1,maxTextureSize:1024},t);const r={},o="model.usda";r[o]=null;let a=ze();a+=an(t);const s={},f={};n.traverseVisible(c=>{if(c.isMesh){const i=c.geometry,l=c.material;if(l.isMeshStandardMaterial){const h="geometries/Geometry_"+i.id+".usda";if(!(h in r)){const v=ln(i);r[h]=un(v)}l.uuid in s||(s[l.uuid]=l),a+=fn(c,i,l)}else console.warn("THREE.USDZExporter: Unsupported material type (USDZ only supports MeshStandardMaterial)",c)}else c.isCamera&&(a+=xn(c))}),a+=sn(),a+=dn(s,f,t.quickLookCompatible),r[o]=re(a),a=null;for(const c in f){let i=f[c];i.isCompressedTexture===!0&&(i=Be(i));const l=on(i.image,i.flipY,t.maxTextureSize),h=await new Promise(v=>l.toBlob(v,"image/png",1));r[`textures/Texture_${c}.png`]=new Uint8Array(await h.arrayBuffer())}let u=0;for(const c in r){const i=r[c],l=34+c.length;u+=l;const h=u&63;if(h!==4){const v=64-h,g=new Uint8Array(v);r[c]=[i,{extra:{12345:g}}]}u=i.length}return tn(r,{level:0})}}function on(e,n,t){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof OffscreenCanvas<"u"&&e instanceof OffscreenCanvas||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const r=t/Math.max(e.width,e.height),o=document.createElement("canvas");o.width=e.width*Math.min(1,r),o.height=e.height*Math.min(1,r);const a=o.getContext("2d");return n===!0&&(a.translate(0,o.height),a.scale(1,-1)),a.drawImage(e,0,0,o.width,o.height),o}else throw new Error("THREE.USDZExporter: No valid image data found. Unable to process texture.")}const T=7;function ze(){return`#usda 1.0
(
	customLayerData = {
		string creator = "Three.js USDZExporter"
	}
	defaultPrim = "Root"
	metersPerUnit = 1
	upAxis = "Y"
)

`}function an(e){return`def Xform "Root"
{
	def Scope "Scenes" (
		kind = "sceneLibrary"
	)
	{
		def Xform "Scene" (
			customData = {
				bool preliminary_collidesWithEnvironment = 0
				string sceneName = "Scene"
			}
			sceneName = "Scene"
		)
		{${e.includeAnchoringProperties===!0?`
		token preliminary:anchoring:type = "${e.ar.anchoring.type}"
		token preliminary:planeAnchoring:alignment = "${e.ar.planeAnchoring.alignment}"
	`:""}
`}function sn(){return`
		}
	}
}

`}function un(e){let n=ze();return n+=e,re(n)}function fn(e,n,t){const r="Object_"+e.id,o=He(e.matrixWorld);return e.matrixWorld.determinant()<0&&console.warn("THREE.USDZExporter: USDZ does not support negative scales",e),`def Xform "${r}" (
	prepend references = @./geometries/Geometry_${n.id}.usda@</Geometry>
	prepend apiSchemas = ["MaterialBindingAPI"]
)
{
	matrix4d xformOp:transform = ${o}
	uniform token[] xformOpOrder = ["xformOp:transform"]

	rel material:binding = </Materials/Material_${t.id}>
}

`}function He(e){const n=e.elements;return`( ${ee(n,0)}, ${ee(n,4)}, ${ee(n,8)}, ${ee(n,12)} )`}function ee(e,n){return`(${e[n+0]}, ${e[n+1]}, ${e[n+2]}, ${e[n+3]})`}function ln(e){return`
def "Geometry"
{
${cn(e)}
}
`}function cn(e){const n="Geometry",t=e.attributes,r=t.position.count;return`
	def Mesh "${n}"
	{
		int[] faceVertexCounts = [${vn(e)}]
		int[] faceVertexIndices = [${hn(e)}]
		normal3f[] normals = [${he(t.normal,r)}] (
			interpolation = "vertex"
		)
		point3f[] points = [${he(t.position,r)}]
${gn(t)}
		uniform token subdivisionScheme = "none"
	}
`}function vn(e){const n=e.index!==null?e.index.count:e.attributes.position.count;return Array(n/3).fill(3).join(", ")}function hn(e){const n=e.index,t=[];if(n!==null)for(let r=0;r<n.count;r++)t.push(n.getX(r));else{const r=e.attributes.position.count;for(let o=0;o<r;o++)t.push(o)}return t.join(", ")}function he(e,n){if(e===void 0)return console.warn("USDZExporter: Normals missing."),Array(n).fill("(0, 0, 0)").join(", ");const t=[];for(let r=0;r<e.count;r++){const o=e.getX(r),a=e.getY(r),s=e.getZ(r);t.push(`(${o.toPrecision(T)}, ${a.toPrecision(T)}, ${s.toPrecision(T)})`)}return t.join(", ")}function pn(e){const n=[];for(let t=0;t<e.count;t++){const r=e.getX(t),o=e.getY(t);n.push(`(${r.toPrecision(T)}, ${1-o.toPrecision(T)})`)}return n.join(", ")}function gn(e){let n="";for(let r=0;r<4;r++){const o=r>0?r:"",a=e["uv"+o];a!==void 0&&(n+=`
		texCoord2f[] primvars:st${o} = [${pn(a)}] (
			interpolation = "vertex"
		)`)}const t=e.color;if(t!==void 0){const r=t.count;n+=`
	color3f[] primvars:displayColor = [${he(t,r)}] (
		interpolation = "vertex"
		)`}return n}function dn(e,n,t=!1){const r=[];for(const o in e){const a=e[o];r.push($n(a,n,t))}return`def "Materials"
{
${r.join("")}
}

`}function $n(e,n,t=!1){const r="			",o=[],a=[];function s(f,u,c){const i=f.source.id+"_"+f.flipY;n[i]=f;const l=f.channel>0?"st"+f.channel:"st",h={1e3:"repeat",1001:"clamp",1002:"mirror"},v=f.repeat.clone(),g=f.offset.clone(),$=f.rotation,w=Math.sin($),E=Math.cos($);return g.y=1-g.y-v.y,t?(g.x=g.x/v.x,g.y=g.y/v.y,g.x+=w/v.x,g.y+=E-1):(g.x+=w*v.x,g.y+=(1-E)*v.y),`
		def Shader "PrimvarReader_${u}"
		{
			uniform token info:id = "UsdPrimvarReader_float2"
			float2 inputs:fallback = (0.0, 0.0)
			token inputs:varname = "${l}"
			float2 outputs:result
		}

		def Shader "Transform2d_${u}"
		{
			uniform token info:id = "UsdTransform2d"
			token inputs:in.connect = </Materials/Material_${e.id}/PrimvarReader_${u}.outputs:result>
			float inputs:rotation = ${($*(180/Math.PI)).toFixed(T)}
			float2 inputs:scale = ${Ee(v)}
			float2 inputs:translation = ${Ee(g)}
			float2 outputs:result
		}

		def Shader "Texture_${f.id}_${u}"
		{
			uniform token info:id = "UsdUVTexture"
			asset inputs:file = @textures/Texture_${i}.png@
			float2 inputs:st.connect = </Materials/Material_${e.id}/Transform2d_${u}.outputs:result>
			${c!==void 0?"float4 inputs:scale = "+Mn(c):""}
			token inputs:sourceColorSpace = "${f.colorSpace===Ne?"raw":"sRGB"}"
			token inputs:wrapS = "${h[f.wrapS]}"
			token inputs:wrapT = "${h[f.wrapT]}"
			float outputs:r
			float outputs:g
			float outputs:b
			float3 outputs:rgb
			${e.transparent||e.alphaTest>0?"float outputs:a":""}
		}`}return e.side===Le&&console.warn("THREE.USDZExporter: USDZ does not support double sided materials",e),e.map!==null?(o.push(`${r}color3f inputs:diffuseColor.connect = </Materials/Material_${e.id}/Texture_${e.map.id}_diffuse.outputs:rgb>`),e.transparent?o.push(`${r}float inputs:opacity.connect = </Materials/Material_${e.id}/Texture_${e.map.id}_diffuse.outputs:a>`):e.alphaTest>0&&(o.push(`${r}float inputs:opacity.connect = </Materials/Material_${e.id}/Texture_${e.map.id}_diffuse.outputs:a>`),o.push(`${r}float inputs:opacityThreshold = ${e.alphaTest}`)),a.push(s(e.map,"diffuse",e.color))):o.push(`${r}color3f inputs:diffuseColor = ${Ae(e.color)}`),e.emissiveMap!==null?(o.push(`${r}color3f inputs:emissiveColor.connect = </Materials/Material_${e.id}/Texture_${e.emissiveMap.id}_emissive.outputs:rgb>`),a.push(s(e.emissiveMap,"emissive",new j(e.emissive.r*e.emissiveIntensity,e.emissive.g*e.emissiveIntensity,e.emissive.b*e.emissiveIntensity)))):e.emissive.getHex()>0&&o.push(`${r}color3f inputs:emissiveColor = ${Ae(e.emissive)}`),e.normalMap!==null&&(o.push(`${r}normal3f inputs:normal.connect = </Materials/Material_${e.id}/Texture_${e.normalMap.id}_normal.outputs:rgb>`),a.push(s(e.normalMap,"normal"))),e.aoMap!==null&&(o.push(`${r}float inputs:occlusion.connect = </Materials/Material_${e.id}/Texture_${e.aoMap.id}_occlusion.outputs:r>`),a.push(s(e.aoMap,"occlusion",new j(e.aoMapIntensity,e.aoMapIntensity,e.aoMapIntensity)))),e.roughnessMap!==null?(o.push(`${r}float inputs:roughness.connect = </Materials/Material_${e.id}/Texture_${e.roughnessMap.id}_roughness.outputs:g>`),a.push(s(e.roughnessMap,"roughness",new j(e.roughness,e.roughness,e.roughness)))):o.push(`${r}float inputs:roughness = ${e.roughness}`),e.metalnessMap!==null?(o.push(`${r}float inputs:metallic.connect = </Materials/Material_${e.id}/Texture_${e.metalnessMap.id}_metallic.outputs:b>`),a.push(s(e.metalnessMap,"metallic",new j(e.metalness,e.metalness,e.metalness)))):o.push(`${r}float inputs:metallic = ${e.metalness}`),e.alphaMap!==null?(o.push(`${r}float inputs:opacity.connect = </Materials/Material_${e.id}/Texture_${e.alphaMap.id}_opacity.outputs:r>`),o.push(`${r}float inputs:opacityThreshold = 0.0001`),a.push(s(e.alphaMap,"opacity"))):o.push(`${r}float inputs:opacity = ${e.opacity}`),e.isMeshPhysicalMaterial&&(e.clearcoatMap!==null?(o.push(`${r}float inputs:clearcoat.connect = </Materials/Material_${e.id}/Texture_${e.clearcoatMap.id}_clearcoat.outputs:r>`),a.push(s(e.clearcoatMap,"clearcoat",new j(e.clearcoat,e.clearcoat,e.clearcoat)))):o.push(`${r}float inputs:clearcoat = ${e.clearcoat}`),e.clearcoatRoughnessMap!==null?(o.push(`${r}float inputs:clearcoatRoughness.connect = </Materials/Material_${e.id}/Texture_${e.clearcoatRoughnessMap.id}_clearcoatRoughness.outputs:g>`),a.push(s(e.clearcoatRoughnessMap,"clearcoatRoughness",new j(e.clearcoatRoughness,e.clearcoatRoughness,e.clearcoatRoughness)))):o.push(`${r}float inputs:clearcoatRoughness = ${e.clearcoatRoughness}`),o.push(`${r}float inputs:ior = ${e.ior}`)),`
	def Material "Material_${e.id}"
	{
		def Shader "PreviewSurface"
		{
			uniform token info:id = "UsdPreviewSurface"
${o.join(`
`)}
			int inputs:useSpecularWorkflow = 0
			token outputs:surface
		}

		token outputs:surface.connect = </Materials/Material_${e.id}/PreviewSurface.outputs:surface>

${a.join(`
`)}

	}
`}function Ae(e){return`(${e.r}, ${e.g}, ${e.b})`}function Mn(e){return`(${e.r}, ${e.g}, ${e.b}, 1.0)`}function Ee(e){return`(${e.x}, ${e.y})`}function xn(e){const n=e.name?e.name:"Camera_"+e.id,t=He(e.matrixWorld);return e.matrixWorld.determinant()<0&&console.warn("THREE.USDZExporter: USDZ does not support negative scales",e),e.isOrthographicCamera?`def Camera "${n}"
		{
			matrix4d xformOp:transform = ${t}
			uniform token[] xformOpOrder = ["xformOp:transform"]

			float2 clippingRange = (${e.near.toPrecision(T)}, ${e.far.toPrecision(T)})
			float horizontalAperture = ${((Math.abs(e.left)+Math.abs(e.right))*10).toPrecision(T)}
			float verticalAperture = ${((Math.abs(e.top)+Math.abs(e.bottom))*10).toPrecision(T)}
			token projection = "orthographic"
		}
	
	`:`def Camera "${n}"
		{
			matrix4d xformOp:transform = ${t}
			uniform token[] xformOpOrder = ["xformOp:transform"]

			float2 clippingRange = (${e.near.toPrecision(T)}, ${e.far.toPrecision(T)})
			float focalLength = ${e.getFocalLength().toPrecision(T)}
			float focusDistance = ${e.focus.toPrecision(T)}
			float horizontalAperture = ${e.getFilmWidth().toPrecision(T)}
			token projection = "perspective"
			float verticalAperture = ${e.getFilmHeight().toPrecision(T)}
		}
	
	`}export{mn as USDZExporter};
