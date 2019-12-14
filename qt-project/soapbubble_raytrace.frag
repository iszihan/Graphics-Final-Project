#version 400 core

in vec2 fragCoord;
out vec4 fragColor;

in vec3 pos_object;
uniform samplerCube skybox;


uniform int resolutionX;
uniform int resolutionY;
uniform float iTime;
uniform int numWave;
uniform float r0;		// The R0 value to use in Schlick's approximation
uniform float eta1D;		// The eta value to use initially
uniform vec3  eta;              // Contains one eta for each channel (use eta.r, eta.g, eta.b in your code)

const float PI = 3.141592653589793;

const float sphereRadius = 0.5;
const float varfilmwidth = 20.0;
const float minfilmwidth = 150.0;
const float maxfilmwidth = 700.0;

const float nu = 1.4;

mat3 sparsespfilta[13];
mat3 sparsespfiltb[13];
mat3 sparsespfiltconst;

//get bubble positions
uniform vec3 unif_p1;
uniform vec3 unif_p2;
uniform vec3 unif_p3;

#define MAX_BOUNCES 3
#define epsilon 0.001
#define PI 3.14159265
#define gamma 2.2

#define ka 0.2f
#define kd 0.2f
#define ks 1.f

vec3 eye = vec3(0.f, 1.f, 3.f);

// Material
struct Material
{
    float isBubble;
    vec3 a;     // ambient color
    vec3 d;	// diffuse color
    vec3 s;	// specular color
};

// Geometry

struct Ray
{
    vec3 o;	// origin
    vec3 d;	// direction
};

struct Hit
{
    float t;	// solution to p=o+t*d
    vec3 n;	// normal
    Material m;	// material

    bool isCollision; //if current hit is in collision with other spheres
};

const Hit noHit = Hit(1e10, vec3(0.f), Material(0.f, vec3(-1.f), vec3(-1.f), vec3(-1.f)),false);

struct Plane
{
    float d;	// solution to dot(n,p)+d=0
    vec3 n;	// normal
    Material m;	// material
};

struct Sphere
{
    float r;	// radius
    vec3 p;	// center position
    Material m;	// material
};

Hit intersectPlane(Plane p, Ray r)
{
    float dotnd = dot(p.n, r.d);
    if (dotnd > 0.f)
        return noHit;
    float t = -(dot(r.o, p.n) + p.d) / dotnd;
    return Hit(t, p.n, p.m,false);
}

vec4 sp_spectral_filter(vec4 col, float filmwidth, float cosi)
{
    vec4 retcol = vec4(0.0, 0.0, 0.0, 1.0);
    const float NN = 2001.0;
    float a = 1.0/(nu*nu);
    float cost = sqrt(a*cosi*cosi + (1.0-a));
    float n = 2.0*PI*filmwidth*cost/NN;
    float kn = 0.0;
    mat3 filt = sparsespfiltconst;

    for(int i = 0; i < numWave; i++)
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
    return fract(sin(dot(co.xy,vec2(12.9898,78.233))) * 43758.5453);
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

bool isInside(vec2 a, vec2 b)
{
    return a.x < b.x && a.y < b.y;
}

Hit intersectSphere(Sphere s, Ray r, bool isCollision)
{
    vec3 op = s.p - r.o;
    float b = dot(op, r.d);
    float det = b * b - dot(op, op) + s.r * s.r;
    if (det < 0.f)
        return noHit;

    det = sqrt(det);
    float t = b - det;
    if (t < 0.f)
        t = b + det;
    if (t < 0.f)
        return noHit;

    return Hit(t, (r.o + t * r.d - s.p) / s.r, s.m, isCollision);
}

bool compare(inout Hit a, Hit b)
{
    if (b.m.s.r >= 0.f && b.t < a.t) {
        a = b;
        return true;
    }
    return false;
}

Hit intersectScene(Ray r)
{
    float t = iTime / 5.0;
    //Plane p = Plane(0.f, vec3(0.f, 1.f, 0.f), Material(0.f, vec3(0.1f), vec3(0.5f, 0.4f, 0.3f), vec3(0.04f)));

    vec3 p1= vec3(cos(t*1.1),1.f + cos(t*1.3),cos(t*1.7) - 5.f);
    vec3 p2= vec3(cos(t*0.7),1.f + cos(t*1.9),cos(t*2.3) - 5.f);
    vec3 p3= vec3(cos(t*1.3),1.f + cos(t*1.7),cos(t*0.7) - 5.f);

//    Sphere m1 = Sphere(0.5f, vec3(cos(t*1.1),1.f + cos(t*1.3),cos(t*1.7) - 5.f), Material(1.f, vec3(0.1f), vec3(0.f, 0.f, 0.2f), vec3(0.6f)));
//    Sphere m2 = Sphere(0.5f, vec3(cos(t*0.7),1.f + cos(t*1.9),cos(t*2.3) - 5.f), Material(1.f, vec3(0.1f), vec3(0.f), vec3(0.55f, 0.56f, 0.55f)));
//    Sphere m3 = Sphere(0.5f, vec3(sin(t*1.3),1.f + sin(t*1.7),sin(t*0.7) - 5.f), Material(1.f, vec3(0.1f), vec3(0.f), vec3(1.f, 0.77f, 0.34f)));

    //collision detection
    float eps=0.3;



    p1=unif_p1;
    p2=unif_p2;
    p3=unif_p3;

    bool m1_collision=false;
    bool m2_collision=false;
    bool m3_collision=false;

    if(distance(p1,p2)< 2* sphereRadius + eps){

        m1_collision=true;
        m2_collision=true;

     }
     if(distance(p1,p3) < 2* sphereRadius + eps){
         m1_collision=true;
         m3_collision=true;

      }
      if(distance(p2,p3) < 2* sphereRadius + eps){

          m2_collision=true;
          m3_collision=true;

      }





    Sphere m1 = Sphere(0.5f, p1, Material(1.f, vec3(0.1f), vec3(0.f, 0.f, 0.2f), vec3(0.6f)));
    Sphere m2 = Sphere(0.5f, p2, Material(1.f, vec3(0.1f), vec3(0.f), vec3(0.55f, 0.56f, 0.55f)));
    Sphere m3 = Sphere(0.5f, p3, Material(1.f, vec3(0.1f), vec3(0.f), vec3(1.f, 0.77f, 0.34f)));
//    Sphere m1 = Sphere(0.5f, p1, material_1);
//    Sphere m2 = Sphere(0.5f, p2, material_2);
//    Sphere m3 = Sphere(0.2f, p3, material_3);



    Hit hit = noHit;
    //compare(hit, intersectPlane(p, r));
    compare(hit, intersectSphere(m1, r, m1_collision));
    compare(hit, intersectSphere(m2, r, m2_collision));
    compare(hit, intersectSphere(m3, r, m3_collision));
    return hit;
}

// Light
vec3 skyColor(vec3 d) {

    return texture(skybox, d).xyz;

}

float pow5(float x) {
    return x * x * x * x * x;
}

// Schlick approximation
vec3 fresnel(vec3 h, vec3 v, vec3 f0) {
    return pow5(1.f - clamp(dot(h, v), 0.f, 1.f)) * (1.f - f0) + f0;
}

vec3 lightCol = normalize(vec3(0.8f, 0.2f, 0.f));
vec3 lightPos = vec3(8.f, 5.5f, -1.f);
vec3 lightDir = normalize(vec3(0.8f, 0.55f, 1.f));

vec4 background( vec3 rd )
{
    return texture(skybox, rd);
}

vec4 illuminateBubble(Hit hit, in vec3 pos , in vec3 camdir)
{
//    vec3 normal = calcNormal(pos);
    vec3 normal = hit.n;
    vec4 backgroundColor = background(camdir);

    vec3 refdir = reflect(camdir,normal);
    vec4 reflectColor = background(refdir);

    float F = r0 + (1-r0)*pow((1-dot(normal,-camdir)),5);
    float bubbleHeight = 0.5 + 0.5 * normal.y;
//    float filmWidth = varfilmwidth * warpnoise3(pos) + minfilmwidth + (1.0 - bubbleHeight) * (maxfilmwidth - minfilmwidth);
    float filmWidth = varfilmwidth + minfilmwidth + (1.0 - bubbleHeight) * (maxfilmwidth - minfilmwidth);

    vec4 bubbleColor = sp_spectral_filter(reflectColor, filmWidth, dot(normal, camdir));

    if(hit.isCollision){
        bubbleColor=vec4(1.f,0.f,0.f,0.f);
    }

    return mix(backgroundColor, bubbleColor, F);
//    return bubbleColor;
}

// ray tracing
vec3 radiance(Ray r)
{
    vec3 acc = vec3(0.f);
    vec3 att = vec3(1.f);
    float kr = 1.f;
    for (int i = 0; i <= 0; ++i)
    {
        Hit hit = intersectScene(r);
        vec3 pt = r.o + hit.t * r.d;
        if (hit.m.s.r >= 0.f) {

//            vec3 f = fresnel(hit.n, -r.d, hit.m.s);
//            // Ambient + Diffuse
//            if (intersectScene(Ray(pt + epsilon * lightDir, lightDir)).m.d.r < 0.f) {
//                acc += ka * hit.m.a;
//                acc += kd * (1.f - f) * att * hit.m.d * clamp(dot(hit.n, lightDir), 0.f, 1.f) * lightCol;
//            }
//            // Specular: next bounce
//            att *= f;
//            vec3 d = reflect(r.d, hit.n);
//            acc += att * hit.m.s * ks * pow(clamp(dot(normalize(eye - pt), normalize(reflect(pt - lightPos, hit.n))), 0.f, 1.f), 20.f);
//            if (hit.m.isBubble > 0.5f) {
//                float bubbleHeight = 0.5 + 0.5 * hit.n.y;
//                float filmWidth = varfilmwidth * warpnoise3(pt) + minfilmwidth + (1.0 - bubbleHeight) * (maxfilmwidth - minfilmwidth);
//                vec3 bubbleColor = vec3(sp_spectral_filter(vec4(acc, 1.f), filmWidth, dot(hit.n, pt - r.o)));
//                acc = mix(acc, bubbleColor, f);
//                r = Ray(r.o + hit.t * r.d + (epsilon + 1.f) * r.d, r.d);
//            } else {
//                r = Ray(r.o + hit.t * r.d + epsilon * d, d);
//            }
//            acc *= kr;
//            kr *= ks;

            acc += illuminateBubble(hit, pt, r.d).xyz;

        } else {
            acc += skyColor(r.d);
            break;
        }
    }
    return acc;
}

mat3 calcLookAtMatrix( in vec3 ro, in vec3 ta, in float roll )
{
    vec3 ww = normalize( ta - ro );
    vec3 uu = normalize( cross(ww,vec3(sin(roll),cos(roll),0.0) ) );
    vec3 vv = normalize( cross(uu,ww));
    return mat3( uu, vv, ww );
}

// main function
void main()
{
    initiateFilters();

    vec2 iResolution = vec2(resolutionX, resolutionY);
    vec2 xy = fragCoord;

    float t = iTime;
    vec3 campos = vec3(8.0*sin(0.3),0.0,-8.0*cos(0.3));
    vec3 camtar = vec3(0.0,0.0,0.0);

    mat3 camMat = calcLookAtMatrix( campos, camtar, 0.0 );  // 0.0 is the camera roll
    vec3 camdir = normalize( camMat * vec3(xy,1.0) ); // 2.0 is the lens length

    Ray r = Ray(campos, camdir);
    vec3 color = radiance(r);
    fragColor = vec4(color, 1.0);
}


