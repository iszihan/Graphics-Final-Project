#ifndef POSITION_H
#define POSITION_H

#include <glm.hpp>
#include <cmath>

//glm::vec3 init_p1=glm::vec3();
void update_positions(glm::vec3* p1, glm::vec3* p2, glm::vec3* p3,
                      glm::vec3* v1, glm::vec3* v2, glm::vec3* v3);
void checkForWalls(glm::vec3* p1, glm::vec3* v1);
bool isCollision(glm::vec3* p1, glm::vec3* p2,
                 glm::vec3* v1, glm::vec3* v2);
void negate_velocity(glm::vec3* v);
#endif // POSITION_H
