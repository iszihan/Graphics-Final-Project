#version 330 core

out vec4 fragColor;

uniform samplerCube skybox;

in vec3 pos_object;
in vec2 fragCoord;

uniform int resolutionX;
uniform int resolutionY;
uniform float iTime;
uniform int numWave;
uniform float r0;		// The R0 value to use in Schlick's approximation
uniform float eta1D;		// The eta value to use initially
uniform vec3  eta;              // Contains one eta for each channel (use eta.r, eta.g, eta.b in your code)

//void main() {
//     fragColor = texture(skybox, pos_object);
//}

const float PI = 3.141592653589793;

const float sphereRadius = 0.5;
const float varfilmwidth = 20.0;
const float minfilmwidth = 150.0;
const float maxfilmwidth = 700.0;

const float nu = 1.4;

mat3 sparsespfilta[13];
mat3 sparsespfiltb[13];
mat3 sparsespfiltconst;


// The above process is condensed into a single filter function.
// Instead of summing over 81 wavelength coefficents, the fourier
// coefficients of the filter are used (13 for cos and sin components each),
// and the fourier representation of the function is used to evaluate the entire function.
// This is a vastly more efficient evaluation.
// Cite:https://www.shadertoy.com/view/XtKyRK
vec4 sp_spectral_filter(vec4 col, float filmwidth, float cosi)
{
    vec4 retcol = vec4(0.0, 0.0, 0.0, 1.0);
    const float NN = 2001.0;
    float a = 1.0/(nu*nu);
    float cost = sqrt(a*cosi*cosi + (1.0-a));
    float n = 2.0*PI*filmwidth*cost/NN; //some kind of measure of light interference in terms of film width and incident light angle
    float kn = 0.0;
    mat3 filt = sparsespfiltconst;

    for(int i = 0; i < numWave; i++)
    {
        kn = (float(i)+6.0f)*n; //can be interpreted as light interference for different wavelength here?

        filt += sparsespfilta[i]*cos(kn) + sparsespfiltb[i]*sin(kn);//because Ac + Bc = (A+B)c
    }

    retcol.xyz = 4.0*(filt*col.xyz)/NN;
    return retcol;
}

void initiateFilters(){
    sparsespfiltconst = mat3(vec3(997.744490776777870, 0.000000000000000, 0.000000000000000),
                             vec3(0.000000000000000, 1000.429230968840700, 0.000000000000000),
                             vec3(0.000000000000000, 0.000000000000000, 1000.314923254210300));
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

float sphere(vec3 pos)
{
    return length(pos)-1.0;
}

float blob5(float d1, float d2, float d3, float d4, float d5)
{
    float k = 2.0;
    return -log(exp(-k*d1)+exp(-k*d2)+exp(-k*d3)+exp(-k*d4)+exp(-k*d5))/k;
}

float scene(vec3 pos)
{
    float t = iTime/5.f;

    float ec = 3; // ~how far apart the five spheres are within the metalball scene
    float s1 = sphere(pos - ec * vec3(cos(t*1.1),cos(t*1.3),cos(t*1.7)));
    float s2 = sphere(pos + ec * vec3(cos(t*0.7),cos(t*1.9),cos(t*2.3)));
    float s3 = sphere(pos + ec * vec3(cos(t*0.3),cos(t*2.9),sin(t*1.1)));
    float s4 = sphere(pos + ec * vec3(sin(t*1.3),sin(t*1.7),sin(t*0.7)));
    float s5 = sphere(pos + ec * vec3(sin(t*2.3),sin(t*1.9),sin(t*2.9)));

    return blob5(s1, s2, s3, s4, s5);
}

float intersection( in vec3 ro, in vec3 rd )
{
    const float maxd = 20.0;
    const float precis = 0.001;
    float h = precis*2.0;
    float t = 0.0;
    float res = -1.0;

    for( int i=0; i<90; i++ )
    {
        if( h<precis||t>maxd ) break;
        h = scene( ro+rd*t );
        t += h;
    }

    if( t<maxd ) res = t;
    return res;
}

vec3 calcNormal( in vec3 pos )
{
    const float eps = 0.002;

    const vec3 v1 = vec3( 1.0,-1.0,-1.0);
    const vec3 v2 = vec3(-1.0,-1.0, 1.0);
    const vec3 v3 = vec3(-1.0, 1.0,-1.0);
    const vec3 v4 = vec3( 1.0, 1.0, 1.0);

        return normalize( v1*scene( pos + v1*eps ) +
                          v2*scene( pos + v2*eps ) +
                          v3*scene( pos + v3*eps ) +
                          v4*scene( pos + v4*eps ) );
}

vec4 background( vec3 rd )
{
    return texture(skybox, rd);
}

vec3 calcLight( in vec3 pos , in vec3 camdir, in vec3 lightp, in vec3 lightc, in vec3 normal , in vec3 texture)
{
    vec3 lightdir = normalize(pos - lightp);
    float cosa = pow(0.5+0.5*dot(normal, -lightdir),2.5);
    float cosr = max(dot(-camdir, reflect(lightdir, normal)),0.0);

    vec3 diffuse = 1.0 * cosa * texture;
    vec3 phong = vec3(1.0 * pow(cosr, 64.0));

    return lightc * (diffuse + phong);
}


vec4 illuminateBubble( in vec3 pos , in vec3 camdir)
{
    vec3 normal = calcNormal(pos);
    vec4 backgroundColor = background(camdir);

    vec3 refdir = reflect(camdir,normal);
    vec4 reflectColor = background(refdir);

    float F = r0 + (1-r0)*pow((1-dot(normal,-camdir)),5);
    float bubbleHeight = 0.5 + 0.5 * normal.y;
//    float filmWidth = varfilmwidth * warpnoise3(pos) + minfilmwidth + (1.0 - bubbleHeight) * (maxfilmwidth - minfilmwidth);
    float filmWidth = varfilmwidth + minfilmwidth + (1.0 - bubbleHeight) * (maxfilmwidth - minfilmwidth);

    vec4 bubbleColor = sp_spectral_filter(reflectColor, filmWidth, dot(normal, camdir));

    return mix(backgroundColor, bubbleColor, F);
}

mat3 calcLookAtMatrix( in vec3 ro, in vec3 ta, in float roll )
{
    vec3 ww = normalize( ta - ro );
    vec3 uu = normalize( cross(ww,vec3(sin(roll),cos(roll),0.0) ) );
    vec3 vv = normalize( cross(uu,ww));
    return mat3( uu, vv, ww );
}

void main()
{
    initiateFilters();

    vec2 xy = fragCoord;

    float t = iTime;
    vec3 campos = vec3(8.0*sin(0.3),0.0,-8.0*cos(0.3));
    vec3 camtar = vec3(0.0,0.0,0.0);

    mat3 camMat = calcLookAtMatrix( campos, camtar, 0.0 );  // 0.0 is the camera roll
    vec3 camdir = normalize( camMat * vec3(xy, 1.0) ); // 1.0 is the lens length

    vec4 col = vec4(0.0,0.0,0.0,0.0);

    float dist = intersection(campos, camdir);

    if (dist < -0.5) col = background(camdir);
    else
    {
        vec3 inters = campos + dist * camdir;
        col = illuminateBubble(inters, camdir);
    }

    fragColor = col;
}
