#include "position.h"


static float radius=0.5f;
static float eps=0.1f;
static float step_length=0.03f;

static float x_upper=3.f;
static float y_upper=3.f;
static float z_upper=3.f;
static float x_lower=-3.f;
static float y_lower=-3.f;
static float z_lower=-3.f;

void update_positions(glm::vec3* p1, glm::vec3* p2, glm::vec3* p3,
                      glm::vec3* v1, glm::vec3* v2, glm::vec3* v3, bool isAvoid){

    //change velocity if hit wall
    checkForWalls(p1,v1);
    checkForWalls(p2,v2);
    checkForWalls(p3,v3);

    if(isAvoid){
    bool collide12=isCollision(p1,p2,v1,v2);
    bool collide13=isCollision(p1,p3,v1,v3);
    bool collide23=isCollision(p2,p3,v2,v3);

    //3 collisions --> negate each velocity
    if(collide12 && collide13 && collide23){

//        v1=-1.f*v1;
//        v2=-1.f*v2;
//        v3=-1.f*v3;
        negate_velocity(v1);
        negate_velocity(v2);
        negate_velocity(v3);


    }else if(collide12 && collide13){
//        v1=-1.f*v1;
//        v2=-1.f*v2;
//        v3=-1.f*v3;
        negate_velocity(v1);
        negate_velocity(v2);
        negate_velocity(v3);
    }else if(collide13 && collide23){
//        v1=-1.f*v1;
//        v2=-1.f*v2;
//        v3=-1.f*v3;
        negate_velocity(v1);
        negate_velocity(v2);
        negate_velocity(v3);
    }else if(collide12 && collide23){
//        v1=-1.f*v1;
//        v2=-1.f*v2;
//        v3=-1.f*v3;
        negate_velocity(v1);
        negate_velocity(v2);
        negate_velocity(v3);

    //single collisions --> take each other's velocity
    }else if(collide12){
        glm::vec3 temp=*v1;
        *v1=*v2;
        *v2=temp;
    }else if(collide13){
        glm::vec3 temp=*v1;
        *v1=*v3;
        *v3=temp;
    }else if(collide23){
        glm::vec3 temp=*v2;
        *v2=*v3;
        *v3=temp;
    }
    }

    //update positions;
    *p1=*p1+step_length* *v1;
    *p2=*p2+step_length* *v2;
    *p3=*p3+step_length* *v3;

}

void negate_velocity(glm::vec3* v){
    v->x=-1.f*v->x;
    v->y=-1.f*v->y;
    v->z=-1.f*v->z;
}

void checkForWalls(glm::vec3* p1, glm::vec3* v1){

    //check for pos x
    glm::vec3 new_p1=*p1+step_length* *v1;
    if(new_p1.x+0.5f+eps > x_upper){
        v1->x= -1.f*v1->x;
    }

    //check for neg x
    new_p1=*p1+step_length* *v1;
    if(new_p1.x-0.5f-eps < x_lower){
        v1->x= -1.f*v1->x;
    }

    //check for pos y
    new_p1=*p1+step_length* *v1;
    if(new_p1.y+0.5f+eps > y_upper){
        v1->y= -1.f*v1->y;
    }

    //check for neg y
    new_p1=*p1+step_length* *v1;
    if(new_p1.y-0.5f-eps < y_lower){
        v1->y= -1.f*v1->y;
    }

    //check for pos z
    new_p1=* p1+step_length* *v1;
    if(new_p1.z+0.5f+eps > z_upper){
        v1->z= -1.f*v1->z;
    }

    //check for neg z
    new_p1=* p1+step_length* *v1;
    if(new_p1.z-0.5f-eps < z_lower){
        v1->z= -1.f*v1->z;
    }
}

bool isCollision(glm::vec3* p1, glm::vec3* p2,
                 glm::vec3* v1, glm::vec3* v2){
    glm::vec3 new_p1=*p1+step_length* *v1;
    glm::vec3 new_p2=*p2+step_length* *v2;

    if(glm::distance(new_p1,new_p2) < 2.f*radius+eps){
        return true;
    }
    return false;
}


