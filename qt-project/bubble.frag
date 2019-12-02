#version 330 core

in vec3 vertex;                 // The position of the vertex, in camera space!
in vec3 vertexToCamera;         // Vector from the vertex to the eye, which is the camera
in vec3 eyeNormal;	        // Normal of the vertex, in camera space!

uniform float r0;		// The R0 value to use in Schlick's approximation
uniform float eta1D;		// The eta value to use initially
uniform vec3  eta;              // Contains one eta for each channel (use eta.r, eta.g, eta.b in your code)

uniform mat4 view;
uniform mat4 model;

uniform samplerCube envMap;

out vec4 fragColor;

const float PI = 3.141592653589793;

const float sphereRadius = 0.5;
const float varfilmwidth = 20.0;
const float minfilmwidth = 150.0;
const float maxfilmwidth = 700.0;

const float nu = 1.4;

mat3 sparsespfilta[13];
mat3 sparsespfiltb[13];
mat3 sparsespfiltconst;

vec4 sp_spectral_filter(vec4 col, float filmwidth, float cosi)
{
    vec4 retcol = vec4(0.0, 0.0, 0.0, 1.0);
    const float NN = 2001.0;
    float a = 1.0/(nu*nu);
    float cost = sqrt(a*cosi*cosi + (1.0-a));
    float n = 2.0*PI*filmwidth*cost/NN;
    float kn = 0.0;
    mat3 filt = sparsespfiltconst;

    for(int i = 0; i < 13; i++)
    {
        kn = (float(i)+6.0f)*n;
        filt += sparsespfilta[i]*cos(kn) + sparsespfiltb[i]*sin(kn);
    }

    retcol.xyz = 4.0*(filt*col.xyz)/NN;
    return retcol;
}

void initiateFilters(){
    sparsespfiltconst = mat3(vec3(997.744490776777870, 0.000000000000000, 0.000000000000000), vec3(0.000000000000000, 1000.429230968840700, 0.000000000000000), vec3(0.000000000000000, 0.000000000000000, 1000.314923254210300));
    sparsespfilta[0] = mat3(vec3(-9.173541963568921, 0.000000000000000, 0.000000000000000), vec3(0.000000000000000, 0.000000000000000, 0.000000000000000), vec3(0.000000000000000, 0.000000000000000, 0.000000000000000));
    sparsespfilta[1] = mat3(vec3(-12.118820092848431, 0.000000000000000, 0.000000000000000), vec3(0.000000000000000, 0.362717643641774, 0.000000000000000), vec3(0.000000000000000, 0.000000000000000, 0.000000000000000));
    sparsespfilta[2] = mat3(vec3(-18.453733912103289, 0.000000000000000, 0.000000000000000), vec3(0.000000000000000, 1.063838675818334, 0.000000000000000), vec3(0.000000000000000, 0.000000000000000, 0.000000000000000));
    sparsespfilta[3] = mat3(vec3(-448.414255038845680, -26.846846493079958, 0.000000000000000), vec3(94.833575999184120, 9.525075729872752, 0.000000000000000), vec3(-48.773853498042200, 0.000000000000000, -0.416692876008104));
    sparsespfilta[4] = mat3(vec3(6.312176276235818, -29.044711065580177, 0.000000000000000), vec3(-187.629408328884550, -359.908263134928520, 0.000000000000000), vec3(0.000000000000000, 25.579031651446712, -0.722360089703890));
    sparsespfilta[5] = mat3(vec3(-33.547962219868452, 61.587972582979901, 0.000000000000000), vec3(97.565538879460178, -150.665614921761320, -30.220477643983013), vec3(1.552347379820659, -0.319166631512109, -0.935186347338915));
    sparsespfilta[6] = mat3(vec3(3.894757056395064, 0.000000000000000, 10.573132007634964), vec3(0.000000000000000, -3.434367603334157, -9.216617325755173), vec3(39.438244799684632, 0.000000000000000, -274.009089525723140));
    sparsespfilta[7] = mat3(vec3(3.824490469437192, 0.000000000000000, 0.000000000000000), vec3(0.000000000000000, -1.540065958710146, 35.179624268750139), vec3(0.000000000000000, 0.000000000000000, -239.475015979167920));
    sparsespfilta[8] = mat3(vec3(2.977660826364815, 0.000000000000000, 0.000000000000000), vec3(0.000000000000000, -1.042036915995045, 0.000000000000000), vec3(0.000000000000000, 0.000000000000000, -2.472524681362817));
    sparsespfilta[9] = mat3(vec3(2.307327051977537, 0.000000000000000, 0.000000000000000), vec3(0.000000000000000, -0.875061637866728, 0.000000000000000), vec3(0.000000000000000, 0.000000000000000, -1.409849313639845));
    sparsespfilta[10] = mat3(vec3(1.823790655724537, 0.000000000000000, 0.000000000000000), vec3(0.000000000000000, -0.781918646414733, 0.000000000000000), vec3(0.000000000000000, 0.000000000000000, -1.048825978147449));
    sparsespfilta[11] = mat3(vec3(0.000000000000000, 0.000000000000000, 0.000000000000000), vec3(0.000000000000000, 0.000000000000000, 0.000000000000000), vec3(0.000000000000000, 0.000000000000000, -0.868933490490107));
    sparsespfilta[12] = mat3(vec3(0.000000000000000, 0.000000000000000, 0.000000000000000), vec3(0.000000000000000, 0.000000000000000, 0.000000000000000), vec3(0.000000000000000, 0.000000000000000, -0.766926116519291));
    sparsespfiltb[0] = mat3(vec3(36.508697968439087, 0.000000000000000, 0.000000000000000), vec3(0.000000000000000, 0.000000000000000, 0.000000000000000), vec3(0.000000000000000, 0.000000000000000, 0.000000000000000));
    sparsespfiltb[1] = mat3(vec3(57.242341893668829, 0.000000000000000, 0.000000000000000), vec3(0.000000000000000, 38.326477066948989, 0.000000000000000), vec3(0.000000000000000, 0.000000000000000, 0.000000000000000));
    sparsespfiltb[2] = mat3(vec3(112.305664332688050, 0.000000000000000, 0.000000000000000), vec3(0.000000000000000, 59.761768151790150, 0.000000000000000), vec3(0.000000000000000, 0.000000000000000, 0.000000000000000));
    sparsespfiltb[3] = mat3(vec3(295.791838308625070, 58.489998502973329, 0.000000000000000), vec3(70.091833386311293, 120.512061156381040, 0.000000000000000), vec3(17.204619265336060, 0.000000000000000, 37.784871450121273));
    sparsespfiltb[4] = mat3(vec3(-253.802681237032970, -160.471170139118780, 0.000000000000000), vec3(-194.893137314865900, 220.339388056683760, 0.000000000000000), vec3(0.000000000000000, -22.651202495658183, 57.335351084503102));
    sparsespfiltb[5] = mat3(vec3(-114.597984116320400, 38.688618505605739, 0.000000000000000), vec3(30.320616033665370, -278.354607015268130, 9.944900164751438), vec3(-30.962164636838232, 37.612068254920686, 113.260728861048410));
    sparsespfiltb[6] = mat3(vec3(-78.527368894236332, 0.000000000000000, 30.382451414099631), vec3(0.000000000000000, -116.269817575252430, -55.801473552703627), vec3(0.353768568406928, 0.000000000000000, 243.785483416097240));
    sparsespfiltb[7] = mat3(vec3(-53.536668214025610, 0.000000000000000, 0.000000000000000), vec3(0.000000000000000, -68.933243211639621, 17.821880498324404), vec3(0.000000000000000, 0.000000000000000, -278.470203722289060));
    sparsespfiltb[8] = mat3(vec3(-42.646930307293360, 0.000000000000000, 0.000000000000000), vec3(0.000000000000000, -51.026918452773138, 0.000000000000000), vec3(0.000000000000000, 0.000000000000000, -113.420624636770270));
    sparsespfiltb[9] = mat3(vec3(-35.705990828985080, 0.000000000000000, 0.000000000000000), vec3(0.000000000000000, -40.934269625438475, 0.000000000000000), vec3(0.000000000000000, 0.000000000000000, -67.307342271105213));
    sparsespfiltb[10] = mat3(vec3(-30.901151041566411, 0.000000000000000, 0.000000000000000), vec3(0.000000000000000, -34.440424768095276, 0.000000000000000), vec3(0.000000000000000, 0.000000000000000, -49.156471643386766));
    sparsespfiltb[11] = mat3(vec3(0.000000000000000, 0.000000000000000, 0.000000000000000), vec3(0.000000000000000, 0.000000000000000, 0.000000000000000), vec3(0.000000000000000, 0.000000000000000, -39.178407337105710));
    sparsespfiltb[12] = mat3(vec3(0.000000000000000, 0.000000000000000, 0.000000000000000), vec3(0.000000000000000, 0.000000000000000, 0.000000000000000), vec3(0.000000000000000, 0.000000000000000, -32.812895526130347));

}

// Fractal Brownian Motion

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float fBm(vec3 p) {
	float v = 0.0;
    float amplitude = 4.0;
    float scale = 1.0;
    int octaves = 2;
    for(int i = 0; i < octaves; ++i) {
    	v += amplitude*rand(scale*p.xy);
        amplitude *= 0.5;
        scale *= 2.0;
    }
    return v;
}

// 1 level of warp noise for micro waves on bubble surface
float warpnoise3(vec3 p) {
    float f = 0.0;
    const float c1 = 0.06;
    const float tc = 0.05;
    vec3 q = vec3(fBm(p + tc),
                  fBm(p + vec3(5.1, 1.3, 2.2) + tc),
                  fBm(p + vec3(3.4, 4.8, 5.5) + tc));

    return 1.2*fBm(p + c1*q);
}


void main()
{

    initiateFilters();

    vec3 n = normalize(eyeNormal);
    vec3 cameraToVertex = normalize(vertex); //remember we are in camera space!
    vec4 world_raydir = transpose(inverse(view * model)) * vec4(cameraToVertex, 0.0);
    vec4 backgroundColor = texture(envMap, world_raydir.xyz);

    vec3 refDir = reflect(cameraToVertex,n);
    vec4 ref = transpose(inverse(view)) * vec4(refDir.x, refDir.y, refDir.z,0);
    vec4 reflectColor = texture(envMap, ref.xyz);

    vec3 refractDir_r = refract(cameraToVertex, n, eta.r);
    vec3 refractDir_g = refract(cameraToVertex, n, eta.g);
    vec3 refractDir_b = refract(cameraToVertex, n, eta.b);

    vec4 w_refractDir_r = transpose(inverse(view)) * vec4(refractDir_r.x, refractDir_r.y, refractDir_r.z,0);
    vec4 w_refractDir_g = transpose(inverse(view)) * vec4(refractDir_g.x, refractDir_g.y, refractDir_g.z,0);
    vec4 w_refractDir_b = transpose(inverse(view)) * vec4(refractDir_b.x, refractDir_b.y, refractDir_b.z,0);

    float refractColor_r = texture(envMap, w_refractDir_r.xyz).r;
    float refractColor_g = texture(envMap, w_refractDir_g.xyz).g;
    float refractColor_b = texture(envMap, w_refractDir_b.xyz).b;
    vec4 refractColor = vec4(refractColor_r, refractColor_g, refractColor_b, 1.0);

    float F = r0 + (1-r0)*pow((1-dot(n,-cameraToVertex)),5);
    float bubbleHeight = 0.5 + 0.5 * n.y;
    float filmWidth = varfilmwidth * warpnoise3(vertex) + minfilmwidth + (1.0 - bubbleHeight) * (maxfilmwidth - minfilmwidth);
    vec4 bubbleColor = sp_spectral_filter(reflectColor, filmWidth, dot(n, cameraToVertex));
    vec4 fragColor_first = mix(backgroundColor, bubbleColor, F);

    float backbubbleHeight = 0.5 - 0.5 * n.y;
    vec3 backVertex = vertex+ vec3(0.f, 0.f, -sphereRadius * 2.f);
    vec3 cameraTobackVertex = normalize(backVertex); //remember we are in camera space!
    float backF = r0 + (1-r0)*pow((1-dot(n,-cameraTobackVertex)),5);
    float backfilmWidth = varfilmwidth * warpnoise3(backVertex) + minfilmwidth + (1.0 - backbubbleHeight) * (maxfilmwidth - minfilmwidth);
    vec4 backbubbleColor = sp_spectral_filter(reflectColor, backfilmWidth, dot(n, cameraTobackVertex));
    fragColor = mix(fragColor_first, backbubbleColor, backF);

}
