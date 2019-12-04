#version 400 core

in vec2 fragCoord;
out vec4 fragColor;

uniform int resolutionX;
uniform int resolutionY;
uniform int mouseX;
uniform int mouseY;

#define MAX_BOUNCES 1
#define epsilon 0.001
#define gamma 2.2

#define ka 1.f
#define kd 1.f
#define ks 1.f

vec3 eye = vec3(0.f, 1.f, 3.f);

// Material

struct Material
{
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
};

const Hit noHit = Hit(1e10, vec3(0.f), Material(vec3(-1.f), vec3(-1.f), vec3(-1.f)));

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
    return Hit(t, p.n, p.m);
}

bool isInside(vec2 a, vec2 b)
{
    return a.x < b.x && a.y < b.y;
}

Hit intersectSphere(Sphere s, Ray r)
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

    return Hit(t, (r.o + t * r.d - s.p) / s.r, s.m);
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
    Sphere s1 = Sphere(1.f, vec3(-2.f, 1.f, 0.f), Material(vec3(0.1f), vec3(1.f, 0.f, 0.2f), vec3(0.04f)));
    Sphere s2 = Sphere(0.8f, vec3(0.5f, 0.8f, -1.2f), Material(vec3(0.1f), vec3(0.f), vec3(0.55f, 0.56f, 0.55f)));
    Sphere s3 = Sphere(0.8f, vec3(2.f, 0.8f, -0.8f), Material(vec3(0.1f), vec3(0.f), vec3(1.f, 0.77f, 0.34f)));
    Plane p = Plane(0.f, vec3(0.f, 1.f, 0.f), Material(vec3(0.1f), vec3(0.5f, 0.4f, 0.3f), vec3(0.04f)));

    Hit hit = noHit;
    compare(hit, intersectPlane(p, r));
    compare(hit, intersectSphere(s1, r));
    compare(hit, intersectSphere(s2, r));
    compare(hit, intersectSphere(s3, r));
    return hit;
}

// ---8<----------------------------------------------------------------------
// Light

vec3 skyColor(vec3 d) {
    float transition = pow(smoothstep(0.02, .5, d.y), 0.4);
    return mix(vec3(0.52f, 0.77f, 1.f), vec3(0.12f, 0.43f, 1.f), transition);
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
vec3 lightDir = normalize(vec3(0.8f, 0.55f, -1.f));

// ray tracing
vec3 radiance(Ray r)
{
    vec3 acc = vec3(0.f);
    vec3 att = vec3(1.f);
    float kr = 1.f;
    for (int i = 0; i <= MAX_BOUNCES; ++i)
    {
        Hit hit = intersectScene(r);
        vec3 pt = r.o + hit.t * r.d;
        if (hit.m.s.r >= 0.f) {
            vec3 f = fresnel(hit.n, -r.d, hit.m.s);
            // Ambient + Diffuse
            if (intersectScene(Ray(pt + epsilon * lightDir, lightDir)).m.d.r < 0.f) {
                acc += ka * hit.m.a;
                acc += (1.f - f) * att * hit.m.d * clamp(dot(hit.n, lightDir), 0.f, 1.f) * lightCol;
            }
            // Specular: next bounce
            att *= f;
            vec3 d = reflect(r.d, hit.n);
            acc += att * hit.m.s * ks * pow(clamp(dot(normalize(eye - pt), normalize(reflect(pt - lightPos, hit.n))), 0.f, 1.f), 20.f);
            r = Ray(r.o + hit.t * r.d + epsilon * d, d);
            acc *= kr;
            kr *= ks;
        } else {
            // TODO: skybox
            acc += att * skyColor(r.d);
            break;
        }
    }
    return acc;
}

// main function
void main()
{
    vec2 uv = vec2(fragCoord.x * resolutionX / resolutionY, fragCoord.y);
    vec3 d = normalize(vec3(uv.x, uv.y, -1.f));
    Ray r = Ray(eye, d);
    vec3 color = radiance(r);
    fragColor = vec4(color, 1.0);
}
