#include "glwidget.h"
#include <QMouseEvent>
#include <sstream>

#include "shapes/sphere.h"
#include "shapes/cube.h"
#include "camera/orbitingcamera.h"
#include "lib/resourceloader.h"
#include "uniforms/varsfile.h"
#include "gl/shaders/shaderattriblocations.h"
#include "glm/gtc/type_ptr.hpp"
#include "glm/gtc/matrix_transform.hpp"
#include "gl/textures/Texture2D.h"
#include <iostream>

UniformVariable *GLWidget::s_skybox = NULL;
UniformVariable *GLWidget::s_projection = NULL;
UniformVariable *GLWidget::s_model = NULL;
UniformVariable *GLWidget::s_view = NULL;
UniformVariable *GLWidget::s_mvp = NULL;
UniformVariable *GLWidget::s_time = NULL;
UniformVariable *GLWidget::s_size = NULL;
UniformVariable *GLWidget::s_mouse = NULL;
std::vector<UniformVariable*> *GLWidget::s_staticVars = NULL;

GLWidget::GLWidget(QGLFormat format, QWidget *parent)
    : QGLWidget(format, parent), m_width(width()), m_height(height()), m_FBO(nullptr), m_sphere(nullptr), m_cube(nullptr),m_quad(nullptr),
      m_particlesFBO1(nullptr), m_particlesFBO2(nullptr),
      m_shape(nullptr), skybox_cube(nullptr), m_numParticles(3), m_firstPass(true), m_evenPass(true)
{
    camera = new OrbitingCamera();
    QObject::connect(camera, SIGNAL(viewChanged(glm::mat4)), this, SLOT(viewChanged(glm::mat4)));
    QObject::connect(camera, SIGNAL(projectionChanged(glm::mat4)), this, SLOT(projectionChanged(glm::mat4)));
    QObject::connect(camera, SIGNAL(modelviewProjectionChanged(glm::mat4)), this, SLOT(modelviewProjectionChanged(glm::mat4)));

    activeUniforms = new QList<const UniformVariable *>();
    current_shader = NULL;
    wireframe_shader2 = NULL;

    timer = new QTimer(this);
    connect(timer, SIGNAL(timeout()), this, SLOT(update()));
    timer->start(1000.0f/60.0f);

    s_staticVars = new std::vector<UniformVariable*>();

    changeAnimMode(ANIM_NONE);

    drawWireframe = true;
    wireframeMode = WIREFRAME_NORMAL;
    mouseDown = false;
    setMouseTracking(true);
}

GLWidget::~GLWidget() {
    delete camera;

    delete activeUniforms;
    delete timer;

    delete skybox_shader;
    delete wireframe_shader;

    foreach (const UniformVariable *v, permUniforms) {
        delete v;
    }
    glDeleteVertexArrays(1, &m_particlesVAO);

}

bool GLWidget::saveUniforms(QString path)
{
    QList<const UniformVariable *> toSave;
    foreach (const UniformVariable *v, *activeUniforms) {
        toSave += v;
    }
    foreach (const UniformVariable *v, permUniforms) {
        toSave += v;
    }

    return VarsFile::save(path, &toSave);
}

bool GLWidget::loadUniforms(QString path)
{
    QList<const UniformVariable*> fromFile;

    foreach (const UniformVariable *v, permUniforms) {
        delete v;
    }
    permUniforms.clear();

    if (!VarsFile::load(path, &fromFile, context()->contextHandle())) return false;

    bool match;
    foreach (const UniformVariable *v, fromFile) {
        match = false;
        foreach (const UniformVariable *u, *activeUniforms) {
            if (!v->getName().compare(u->getName()) && v->getType() == u->getType()) {
                // Really really really bad, but the best option I can think of for now
                // sskybox_shaderetPermanent doesn't really modify the object much, sort of a small
                // flag for how to save it
                UniformVariable *utemp = const_cast<UniformVariable *>(u);
                utemp->setPermanent(v->getPermanent());
                emit(changeUniform(u, v->toString()));
                match = true;
            }
        }

        if (!match && v->getPermanent()) {
            permUniforms += v;
        } else {
            delete v;
        }
    }
    return true;
}

void GLWidget::initializeGL() {
    ResourceLoader::initializeGlew();

    glClearColor(0.0, 0.0, 0.0, 1.0);
    glEnable(GL_DEPTH_TEST);
    glEnable(GL_TEXTURE_2D);
    glEnable(GL_TEXTURE_CUBE_MAP);

    glDisable(GL_COLOR_MATERIAL);
    glCullFace(GL_BACK);
    glEnable(GL_CULL_FACE);
    glDisable(GL_BLEND);
    glEnable(GL_TEXTURE_CUBE_MAP_SEAMLESS);

    m_horizontalBlurProgram = ResourceLoader::newShaderProgram(context(),":/shaders/quad.vert", ":/shaders/horizontalBlur.frag");
//    skybox_shader = ResourceLoader::newShaderProgram(context(), ":/shaders/skybox.vert", ":/shaders/soapbubble_raytrace.frag");
    m_sphereUpdateShader = ResourceLoader::newShaderProgram(context(), ":/shaders/quad.vert", ":/shaders/particles_update.frag");
    m_sphereDrawShader = ResourceLoader::newShaderProgram(context(),":/shaders/particles_draw.vert", ":/shaders/particles_draw.frag");
//    wireframe_shader = ResourceLoader::newShaderProgram(context(), ":/shaders/standard.vert", ":/shaders/color.frag");

    s_skybox = new UniformVariable(this->context()->contextHandle());
    s_skybox->setName("skybox");
    s_skybox->setType(UniformVariable::TYPE_TEXCUBE);
    //top, bottom, left, right, front, back
    s_skybox->parse(":/skybox/posy.jpg,:/skybox/negy.jpg,:/skybox/negx.jpg,:/skybox/posx.jpg,:/skybox/posz.jpg,:/skybox/negz.jpg");

    s_model = new UniformVariable(this->context()->contextHandle());
    s_model->setName("model");
    s_model->setType(UniformVariable::TYPE_MAT4);
    s_model->parse("1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1");

    s_projection = new UniformVariable(this->context()->contextHandle());
    s_projection->setName("projection");
    s_projection->setType(UniformVariable::TYPE_MAT4);

    s_view = new UniformVariable(this->context()->contextHandle());
    s_view->setName("view");
    s_view->setType(UniformVariable::TYPE_MAT4);

    s_mvp = new UniformVariable(this->context()->contextHandle());
    s_mvp->setName("mvp");
    s_mvp->setType(UniformVariable::TYPE_MAT4);

    s_time = new UniformVariable(this->context()->contextHandle());
    s_time->setName("time");
    s_time->setType(UniformVariable::TYPE_TIME);

    s_size = new UniformVariable(this->context()->contextHandle());
    s_size->setName("size");
    s_size->setType(UniformVariable::TYPE_FLOAT2);

    s_mouse = new UniformVariable(this->context()->contextHandle());
    s_mouse->setName("mouse");
    s_mouse->setType(UniformVariable::TYPE_FLOAT3);

    s_staticVars->push_back(s_skybox);
    s_staticVars->push_back(s_model);
    s_staticVars->push_back(s_projection);
    s_staticVars->push_back(s_view);
    s_staticVars->push_back(s_mvp);
    s_staticVars->push_back(s_time);
    s_staticVars->push_back(s_size);
    s_staticVars->push_back(s_mouse);

    gl = QOpenGLFunctions(context()->contextHandle());


    std::vector<GLfloat> quadData = {-1.0, 1.0, 0.0, 0.0, 0.0,
                                     -1.0, -1.0, 0.0, 0.0, 1.0,
                                     1.0, 1.0, 0.0, 1.0, 0.0,
                                     1.0, -1.0, 0.0, 1.0, 1.0};
    m_quad = std::make_unique<OpenGLShape>();
    m_quad->setVertexData(&quadData[0], quadData.size(), VBO::GEOMETRY_LAYOUT::LAYOUT_TRIANGLE_STRIP, 4);
    m_quad->setAttribute(ShaderAttrib::POSITION, 3, 0, VBOAttribMarker::DATA_TYPE::FLOAT, false);
    m_quad->setAttribute(ShaderAttrib::TEXCOORD, 2, 3*sizeof(GLfloat), VBOAttribMarker::DATA_TYPE::FLOAT, false);
    m_quad->buildVAO();

    glGenVertexArrays(1, &m_particlesVAO);
    std::cout<<"num particles during init:"<<m_numParticles<<std::endl;

    m_particlesFBO1 = std::make_shared<FBO>(3,FBO::DEPTH_STENCIL_ATTACHMENT::NONE,m_numParticles,1,
                                            TextureParameters::WRAP_METHOD::CLAMP_TO_EDGE, TextureParameters::FILTER_METHOD::NEAREST, GL_FLOAT);
    m_particlesFBO2 = std::make_shared<FBO>(3,FBO::DEPTH_STENCIL_ATTACHMENT::NONE,m_numParticles,1,
                                            TextureParameters::WRAP_METHOD::CLAMP_TO_EDGE, TextureParameters::FILTER_METHOD::NEAREST, GL_FLOAT);


    std::vector<GLfloat> sphereData = SPHERE_VERTEX_POSITIONS;
    m_sphere = std::make_unique<OpenGLShape>();
    m_sphere->setVertexData(&sphereData[0], sphereData.size(), VBO::GEOMETRY_LAYOUT::LAYOUT_TRIANGLES, NUM_SPHERE_VERTICES);
    m_sphere->setAttribute(ShaderAttrib::POSITION, 3, 0, VBOAttribMarker::DATA_TYPE::FLOAT, false);
    m_sphere->setAttribute(ShaderAttrib::NORMAL, 3, 0, VBOAttribMarker::DATA_TYPE::FLOAT, false);
    m_sphere->buildVAO();

    std::vector<GLfloat> cubeData = CUBE_DATA_POSITIONS;
    m_cube = std::make_unique<OpenGLShape>();
    m_cube->setVertexData(&cubeData[0], cubeData.size(), VBO::GEOMETRY_LAYOUT::LAYOUT_TRIANGLES, NUM_CUBE_VERTICES);
    m_cube->setAttribute(ShaderAttrib::POSITION, 3, 0, VBOAttribMarker::DATA_TYPE::FLOAT, false);
    m_cube->setAttribute(ShaderAttrib::NORMAL, 3, 3*sizeof(GLfloat), VBOAttribMarker::DATA_TYPE::FLOAT, false);
    m_cube->buildVAO();

    skybox_cube = std::make_unique<OpenGLShape>();
    skybox_cube->setVertexData(&cubeData[0], cubeData.size(), VBO::GEOMETRY_LAYOUT::LAYOUT_TRIANGLES, NUM_CUBE_VERTICES);
    skybox_cube->setAttribute(ShaderAttrib::POSITION, 3, 0, VBOAttribMarker::DATA_TYPE::FLOAT, false);
    skybox_cube->setAttribute(ShaderAttrib::NORMAL, 3, 3*sizeof(GLfloat), VBOAttribMarker::DATA_TYPE::FLOAT, false);
    skybox_cube->buildVAO();

    m_shape = m_sphere.get();
}

void GLWidget::resizeGL(int w, int h) {
    std::cout<<"ResizeGL() called with w="<<w<<" and h="<<h<<std::endl;

    m_width = w;
    m_height = h;

    glViewport(0, 0, w, h);
    s_size->parse(QString("%1,%2").arg(QString::number(w), QString::number(h)));
    camera->setAspectRatio(((float) w) / ((float) h));

    m_FBO = std::make_unique<FBO>(1,FBO::DEPTH_STENCIL_ATTACHMENT::NONE,w,h,TextureParameters::WRAP_METHOD::CLAMP_TO_EDGE);
    update();
}

void GLWidget::setParticleViewport() {
    std::cout<<"setParticleViewport() called;"<<std::endl;

//    int maxDim = std::max(m_width, m_height);
//    int x = (m_width - maxDim) / 2.0f;
//    int y = (m_height - maxDim) / 2.0f;
//    glViewport(x, y, maxDim, maxDim);
    glViewport(0, 0, m_width, m_height);

//    glViewport(0,0,m_width, m_height);
}

void GLWidget::handleAnimation() {
    model = glm::mat4();
    switch (animMode) {
    case ANIM_NONE:
        break;
    case ANIM_MOVE_AND_SCALE:
    case ANIM_SCALE:
        if (scale > 2) dscale *= -1;
        if (scale < .5) dscale *= -1;
        scale += scale * dscale;
        model = glm::scale(model, glm::vec3(scale));
        if (animMode == ANIM_SCALE)
            break;
    case ANIM_MOVE:
        if (pos.y > 2) {
            dir *= -1;
        }
        if (pos.y < -2) {
            dir *= -1;
        }
        pos += dir;
        model = glm::translate(model, pos);
        break;
    case ANIM_ROTATE:
        angle += dangle;
        model = glm::rotate(model, degreesToRadians(angle), glm::vec3(0,1,0));
        break;
    case ANIM_ROTATE_2:
        angle += dangle;
        model = glm::rotate(model, degreesToRadians(angle), glm::vec3(0, 0, 1));
        model = glm::translate(model, glm::vec3(0, 2, 0));
        break;
    default:
        break;
    }
    modelChanged(model);
    modelviewProjectionChanged(camera->getProjectionMatrix() * camera->getModelviewMatrix());
}

void GLWidget::paintGL() {
//    handleAnimation();

//    //Attempts to do anti-aliasing with framebuffers;
//    m_FBO->bind();
//    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
//    //background skybox
//    skybox_shader->bind();
//    s_skybox->setValue(skybox_shader);

//    //set uniforms
//    s_projection->setValue(skybox_shader);
//    s_view->setValue(skybox_shader);
//    skybox_shader->setUniformValue("resolutionX", this->size().width());
//    skybox_shader->setUniformValue("resolutionY", this->size().height());
//    float t = QTime::currentTime().minute() * 60.f + QTime::currentTime().second() + QTime::currentTime().msec() / 1000.f;
//    skybox_shader->setUniformValue("iTime", t);
//    foreach (const UniformVariable *var, *activeUniforms) {
//        var->setValue(skybox_shader);
//    }

//    glCullFace(GL_FRONT);
//    m_quad->draw();
//    glCullFace(GL_BACK);
//    m_FBO->unbind();
//    skybox_shader->release();


    //    glClear(GL_COLOR_BUFFER_BIT);
    //    glClear(GL_DEPTH_BUFFER_BIT);
    //    m_FBO->getColorAttachment(0).bind();
    //    m_horizontalBlurProgram->bind();
    //    m_quad->draw();
    //    m_horizontalBlurProgram->release();

    //    if (current_shader) {
    //        glClear(GL_COLOR_BUFFER_BIT);
    //        glClear(GL_DEPTH_BUFFER_BIT);
    //        current_shader->bind();

    //        foreach (const UniformVariable *var, *activeUniforms) {
    //            var->setValue(current_shader);
    //        }
    //        current_shader->setUniformValue("resolutionX", this->size().width());
    //        current_shader->setUniformValue("resolutionY", this->size().height());
    //        float t = QTime::currentTime().minute() * 60.f + QTime::currentTime().second() + QTime::currentTime().msec() / 1000.f;
    //        current_shader->setUniformValue("iTime", t);
    //        skybox_cube->draw();

    //        current_shader->release();
    //    }

    //Attempts to do collision detection with FBO;
    auto prevFBO = m_evenPass ? m_particlesFBO1 : m_particlesFBO2;
    auto nextFBO = m_evenPass ? m_particlesFBO2 : m_particlesFBO1;
    float firstPass = m_firstPass ? 1.0f : 0.0f;

    nextFBO->bind();
    m_sphereUpdateShader->bind();
    gl.glActiveTexture(GL_TEXTURE0);
    prevFBO->getColorAttachment(0).bind();
    gl.glActiveTexture(GL_TEXTURE1);
    prevFBO->getColorAttachment(1).bind();
    gl.glActiveTexture(GL_TEXTURE2);
    m_FBO->getColorAttachment(0).bind();
    m_sphereUpdateShader->setUniformValue("resolutionX", m_width);
    m_sphereUpdateShader->setUniformValue("resolutionY", m_height);

    gl.glUniform1f(gl.glGetUniformLocation(m_sphereUpdateShader->programId(),"firstPass"),firstPass);
    gl.glUniform1i(gl.glGetUniformLocation(m_sphereUpdateShader->programId(),"numParticles"),m_numParticles);
    gl.glUniform1i(gl.glGetUniformLocation(m_sphereUpdateShader->programId(),"prevPos"),0);
    gl.glUniform1i(gl.glGetUniformLocation(m_sphereUpdateShader->programId(),"prevVel"),1);
    gl.glUniform1i(gl.glGetUniformLocation(m_sphereUpdateShader->programId(),"prevCol"),2);

    m_quad->draw();
    nextFBO->unbind();
    m_sphereUpdateShader->release();

    m_FBO->bind();
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
//    glClearColor(1.0, 1.0, 1.0, 1.0);
    //background skybox
    m_sphereDrawShader->bind();
    setParticleViewport();
    gl.glActiveTexture(GL_TEXTURE0);
    nextFBO->getColorAttachment(0).bind();
    gl.glActiveTexture(GL_TEXTURE1);
    nextFBO->getColorAttachment(1).bind();
    gl.glActiveTexture(GL_TEXTURE2);
    nextFBO->getColorAttachment(2).bind();

    //set uniforms
//    s_skybox->setValue(skybox_shader);
//    s_projection->setValue(skybox_shader);
//    s_view->setValue(skybox_shader);
//    m_sphereDrawShader->setUniformValue("resolutionX", this->size().width());
//    m_sphereDrawShader->setUniformValue("resolutionY", this->size().height());
//    float t = QTime::currentTime().minute() * 60.f + QTime::currentTime().second() + QTime::currentTime().msec() / 1000.f;
//    m_sphereDrawShader->setUniformValue("iTime", t);
//    foreach (const UniformVariable *var, *activeUniforms) {
//        var->setValue(skybox_shader);
//    }

//    glCullFace(GL_FRONT);
//    m_quad->draw();
//    glCullFace(GL_BACK);

    gl.glUniform1i(gl.glGetUniformLocation(m_sphereDrawShader->programId(),"pos"),0);
    gl.glUniform1i(gl.glGetUniformLocation(m_sphereDrawShader->programId(),"vel"),1);
    gl.glUniform1i(gl.glGetUniformLocation(m_sphereDrawShader->programId(),"col"),2);

    gl.glUniform1i(gl.glGetUniformLocation(m_sphereDrawShader->programId(),"numParticles"),m_numParticles);

    glBindVertexArray(m_particlesVAO);
    gl.glDrawArrays(GL_TRIANGLES, 0, 3 * m_numParticles);
    glBindVertexArray(0);
    gl.glActiveTexture(GL_TEXTURE0);

    m_FBO->unbind();
    m_sphereDrawShader->release();

    glClear(GL_COLOR_BUFFER_BIT);
    glClear(GL_DEPTH_BUFFER_BIT);
    m_FBO->getColorAttachment(0).bind();
    m_horizontalBlurProgram->bind();
    m_quad->draw();
    m_horizontalBlurProgram->release();

    m_firstPass = false;
    m_evenPass = ! m_evenPass;


}

void GLWidget::changeRenderMode(RenderType mode)
{
    m_renderMode = mode;
    switch(m_renderMode) {
    case SHAPE_SPHERE:
        m_shape = m_sphere.get();
        break;
    case SHAPE_CUBE:
        m_shape = m_cube.get();
        break;
    default:
        break;
    }
}

void GLWidget::changeAnimMode(AnimType mode)
{
    model = glm::mat4();
    animMode = mode;
    pos = glm::vec3(0);
    dir = glm::vec3(0,.03,0);
    scale = 1;
    dscale = .017;
    angle = 0;
    dangle = 2;
}

void GLWidget::toggleDrawWireframe(bool draw)
{
    drawWireframe = draw;
}

void GLWidget::setWireframeMode(WireframeType mode)
{
    wireframeMode = mode;
}

bool GLWidget::loadShader(QString vert, QString frag, QString *errors)
{
    QGLShaderProgram *new_shader = ResourceLoader::newShaderProgram(context(), vert, frag, errors);
    if (new_shader == NULL) {
        return false;
    }

    delete wireframe_shader2;
    wireframe_shader2 = ResourceLoader::newShaderProgram(context(), vert, ":/shaders/color.frag", errors);

    UniformVariable::s_numTextures = 2;

    UniformVariable::resetTimer();

    //http://stackoverflow.com/questions/440144/in-opengl-is-there-a-way-to-get-a-list-of-all-uniforms-attribs-used-by-a-shade

    std::vector<GLchar> nameData(256);
    GLint numActiveUniforms = 0;
    gl.glGetProgramiv(new_shader->programId(), GL_ACTIVE_UNIFORMS, &numActiveUniforms);

    for (int unif = 0; unif < numActiveUniforms; unif++) {
        GLint arraySize = 0;
        GLenum type = 0;
        GLsizei actualLength = 0;
        gl.glGetActiveUniform(new_shader->programId(), unif, nameData.size(), &actualLength, &arraySize, &type, &nameData[0]);
        std::string name((char*)&nameData[0], actualLength);

        UniformVariable::Type uniformType = UniformVariable::typeFromGLEnum(type);

        QString qname = QString::fromStdString(name);
        if (qname.startsWith("gl_")) continue;
        emit(addUniform(uniformType, qname, true, arraySize));
    }

    delete current_shader;
    current_shader = new_shader;
    camera->mouseScrolled(0);
    camera->updateMats();
    update();
    return true;
}

void GLWidget::uniformDeleted(const UniformVariable *uniform)
{
    foreach (UniformVariable *sv, *s_staticVars) {
        if (uniform == sv) return;
    }

    foreach (const UniformVariable *v, *activeUniforms) {
        if (uniform == v)
            delete v;
    }
    activeUniforms->removeAll(uniform);
}

void GLWidget::uniformAdded(const UniformVariable *uniform)
{
    activeUniforms->append(uniform);
}

void GLWidget::viewChanged(const glm::mat4 &modelview)
{
    std::stringstream s;
    const float *data = glm::value_ptr(glm::transpose(modelview));
    for (int i = 0; i < 16; i++) {
        s << data[i];
        if (i < 15)
            s << ",";
    }
    s_view->parse(QString::fromStdString(s.str()));
}

void GLWidget::projectionChanged(const glm::mat4 &projection)
{
    std::stringstream s;
    const float *data = glm::value_ptr(glm::transpose(projection));
    for (int i = 0; i < 16; i++) {
        s << data[i];
        if (i < 15)
            s << ",";
    }
    s_projection->parse(QString::fromStdString(s.str()));
}

void GLWidget::modelviewProjectionChanged(const glm::mat4 &modelviewProjection)
{
    std::stringstream s;
    const float *data = glm::value_ptr(glm::transpose(modelviewProjection * model));
    for (int i = 0; i < 16; i++) {
        s << data[i];
        if (i < 15)
            s << ",";
    }
    s_mvp->parse(QString::fromStdString(s.str()));
}

void GLWidget::modelChanged(const glm::mat4 &modelview)
{
    std::stringstream s;
    const float *data = glm::value_ptr(glm::transpose(modelview));
    for (int i = 0; i < 16; i++) {
        s << data[i];
        if (i < 15)
            s << ",";
    }
    s_model->parse(QString::fromStdString(s.str()));
}

void GLWidget::setPaused(bool paused)
{
    if (paused) {
        timer->stop();
    } else {
        timer->start(1000.0f/60.0f);
    }
}

void GLWidget::mouseMoveEvent(QMouseEvent *event) {
    if (event->buttons() & Qt::LeftButton) {
        camera->mouseDragged(event->x(), event->y());
    }
    s_mouse->parse(QString("%1,%2,%3").arg(
                       QString::number(event->x()),
                       QString::number(event->y()),
                       QString::number(mouseDown)));
}

void GLWidget::wheelEvent(QWheelEvent *event)
{
    camera->mouseScrolled(event->delta());
}

void GLWidget::mousePressEvent(QMouseEvent *event) {
    camera->mouseDown(event->x(), event->y());
    mouseDown = true;
    s_mouse->parse(QString("%1,%2,%3").arg(
                       QString::number(event->x()),
                       QString::number(event->y()),
                       QString::number(mouseDown)));
}

void GLWidget::mouseReleaseEvent(QMouseEvent *event) {
    mouseDown = false;
    s_mouse->parse(QString("%1,%2,%3").arg(
                       QString::number(event->x()),
                       QString::number(event->y()),
                       QString::number(mouseDown)));
}
