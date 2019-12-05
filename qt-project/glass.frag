#version 400 core

out vec4 fragColor;

in vec3 vertex;                 // The position of the vertex, in camera space!
in vec3 vertexToCamera;         // Vector from the vertex to the eye, which is the camera
in vec3 eyeNormal;	        // Normal of the vertex, in camera space!

in vec2 fragCoord;

uniform float r0;		// The R0 value to use in Schlick's approximation
uniform float eta1D;		// The eta value to use initially
uniform vec3  eta;              // Contains one eta for each channel (use eta.r, eta.g, eta.b in your code)

uniform mat4 view;
uniform mat4 model;

uniform samplerCube envMap;

uniform int resolutionX;
uniform int resolutionY;
uniform float iTime;

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
    float t = iTime;

    float ec = 1.5;
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

vec3 background( vec3 rd )
{
    return texture(envMap, rd).xyz;
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

vec3 illuminate( in vec3 pos , in vec3 camdir)
{
    vec3 normal = calcNormal(pos);

    const float ETA = 0.9;
    vec3 refrd = -refract(camdir,normal,ETA);
    vec3 refro = pos + 10.0 * refrd;
    float refdist = intersection(refro, refrd);
    vec3 refpos = refro + refdist * refrd;
    vec3 refnormal = calcNormal(refpos);

    vec3 tex0 = vec3(0.f);
    vec3 tex1 = vec3(0.f);
    if (refdist < -0.5) {
        tex0 = background(-refrd);
        tex1 = tex0;
    }
    vec3 tex2 = vec3(0.f);
    vec3 tex3 = vec3(0.f);
    vec3 texture = vec3(1.0,0.9,0.9)* (0.4 * tex0 + 0.4 * tex1 + 0.03 * tex2 + 0.1 * tex3);

        vec3 l1 = calcLight(pos, camdir, vec3(0.0,10.0,-20.0), vec3(1.0,1.0,1.0), normal, texture);
    vec3 l2 = calcLight(pos, camdir, vec3(-20,10.0,0.0), vec3(1.0,1.0,1.0), normal, texture);
    vec3 l3 = calcLight(pos, camdir, vec3(20.0,10.0,0.0), vec3(1.0,1.0,1.0), normal, texture);
    vec3 l4 = calcLight(pos, camdir, vec3(0.0,-10.0,20.0), vec3(0.6,0.6,0.6), normal, texture);
    return l1+l2+l3+l4;
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
    vec2 iResolution = vec2(resolutionX, resolutionY);
    vec2 xy = fragCoord;

    float t = iTime;
    vec3 campos = vec3(8.0*sin(0.3*t),0.0,-8.0*cos(0.3*t));
    vec3 camtar = vec3(0.0,0.0,0.0);

    mat3 camMat = calcLookAtMatrix( campos, camtar, 0.0 );  // 0.0 is the camera roll
    vec3 camdir = normalize( camMat * vec3(xy,1.0) ); // 2.0 is the lens length

    vec3 col = vec3(0.0,0.0,0.0);

    float dist = intersection(campos, camdir);

    if (dist < -0.5) col = background(camdir);
    else
    {
        vec3 inters = campos + dist * camdir;
        col = illuminate(inters, camdir);
    }

    fragColor = vec4(col,1.0);
}


//#version 330 core

//in vec3 vertex;                 // The position of the vertex, in camera space!
//in vec3 vertexToCamera;         // Vector from the vertex to the eye, which is the camera
//in vec3 eyeNormal;	        // Normal of the vertex, in camera space!

//uniform float r0;		// The R0 value to use in Schlick's approximation
//uniform float eta1D;		// The eta value to use initially
//uniform vec3  eta;              // Contains one eta for each channel (use eta.r, eta.g, eta.b in your code)

//uniform mat4 view;
//uniform mat4 model;

//uniform samplerCube envMap;

//out vec4 fragColor;

//void main()
//{
//    vec3 n = normalize(eyeNormal);
//    vec3 cameraToVertex = normalize(vertex); //remember we are in camera space!
//    vec3 vertexToCamera = normalize(vertexToCamera);
//    // TODO: fill the rest in

//    vec3 refDir = reflect(cameraToVertex,n);
//    vec4 ref = transpose(inverse(view)) * vec4(refDir.x, refDir.y, refDir.z,0);
//    vec4 reflectColor = texture(envMap, ref.xyz);

//    vec3 refractDir_r = refract(cameraToVertex, n, eta.r);
//    vec3 refractDir_g = refract(cameraToVertex, n, eta.g);
//    vec3 refractDir_b = refract(cameraToVertex, n, eta.b);

//    vec4 w_refractDir_r = transpose(inverse(view)) * vec4(refractDir_r.x, refractDir_r.y, refractDir_r.z,0);
//    vec4 w_refractDir_g = transpose(inverse(view)) * vec4(refractDir_g.x, refractDir_g.y, refractDir_g.z,0);
//    vec4 w_refractDir_b = transpose(inverse(view)) * vec4(refractDir_b.x, refractDir_b.y, refractDir_b.z,0);

//    float refractColor_r = texture(envMap, w_refractDir_r.xyz).r;
//    float refractColor_g = texture(envMap, w_refractDir_g.xyz).g;
//    float refractColor_b = texture(envMap, w_refractDir_b.xyz).b;

//    vec4 refractColor = vec4(refractColor_r, refractColor_g, refractColor_b, 1.0);
//    float F = r0 + (1-r0)*pow((1-dot(n,-cameraToVertex)),5);

//    fragColor = mix(refractColor, reflectColor, F);
//}
