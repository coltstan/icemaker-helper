import{o as g,p as u,U as p,e as w,q as h,r as S,d as T,W as C,s as U}from"./index-DMViwzbK.js";let l,c,i,t;function F(e,m=1/0,n=null){c||(c=new g(2,2,1,1)),i||(i=new u({uniforms:{blitTexture:new p(e)},vertexShader:`
			varying vec2 vUv;
			void main(){
				vUv = uv;
				gl_Position = vec4(position.xy * 1.0,0.,.999999);
			}`,fragmentShader:`
			uniform sampler2D blitTexture; 
			varying vec2 vUv;

			void main(){ 
				gl_FragColor = vec4(vUv.xy, 0, 1);
				
				#ifdef IS_SRGB
				gl_FragColor = sRGBTransferOETF( texture2D( blitTexture, vUv) );
				#else
				gl_FragColor = texture2D( blitTexture, vUv);
				#endif
			}`})),i.uniforms.blitTexture.value=e,i.defines.IS_SRGB=e.colorSpace==w,i.needsUpdate=!0,t||(t=new h(c,i),t.frustumCulled=!1);const d=new S,v=new T;v.add(t),n===null&&(n=l=new C({antialias:!1}));const o=Math.min(e.image.width,m),r=Math.min(e.image.height,m);n.setSize(o,r),n.clear(),n.render(v,d);const s=document.createElement("canvas"),f=s.getContext("2d");s.width=o,s.height=r,f.drawImage(n.domElement,0,0,o,r);const a=new U(s);return a.minFilter=e.minFilter,a.magFilter=e.magFilter,a.wrapS=e.wrapS,a.wrapT=e.wrapT,a.colorSpace=e.colorSpace,a.name=e.name,l&&(l.forceContextLoss(),l.dispose(),l=null),a}export{F as d};
