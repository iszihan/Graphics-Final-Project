/********************************************************************************
** Form generated from reading UI file 'mainwindow.ui'
**
** Created by: Qt User Interface Compiler version 5.11.3
**
** WARNING! All changes made in this file will be lost when recompiling UI file!
********************************************************************************/

#ifndef UI_MAINWINDOW_H
#define UI_MAINWINDOW_H

#include <QtCore/QVariant>
#include <QtWidgets/QAction>
#include <QtWidgets/QApplication>
#include <QtWidgets/QCheckBox>
#include <QtWidgets/QDockWidget>
#include <QtWidgets/QGroupBox>
#include <QtWidgets/QMainWindow>
#include <QtWidgets/QMenu>
#include <QtWidgets/QMenuBar>
#include <QtWidgets/QRadioButton>
#include <QtWidgets/QVBoxLayout>
#include <QtWidgets/QWidget>

QT_BEGIN_NAMESPACE

class Ui_MainWindow
{
public:
    QAction *actionQuit;
    QWidget *centralWidget;
    QMenuBar *menuBar;
    QMenu *menuFile;
    QDockWidget *settingsDock;
    QWidget *settingsDockContent;
    QVBoxLayout *settingsLayout;
    QGroupBox *shapeGroupBox;
    QRadioButton *shapeTriangle;
    QRadioButton *shapeTriangleFan;
    QRadioButton *shapeTriangleStrip;
    QCheckBox *linesEnabled;

    void setupUi(QMainWindow *MainWindow)
    {
        if (MainWindow->objectName().isEmpty())
            MainWindow->setObjectName(QStringLiteral("MainWindow"));
        MainWindow->resize(600, 400);
        actionQuit = new QAction(MainWindow);
        actionQuit->setObjectName(QStringLiteral("actionQuit"));
        centralWidget = new QWidget(MainWindow);
        centralWidget->setObjectName(QStringLiteral("centralWidget"));
        MainWindow->setCentralWidget(centralWidget);
        menuBar = new QMenuBar(MainWindow);
        menuBar->setObjectName(QStringLiteral("menuBar"));
        menuBar->setGeometry(QRect(0, 0, 600, 25));
        menuFile = new QMenu(menuBar);
        menuFile->setObjectName(QStringLiteral("menuFile"));
        MainWindow->setMenuBar(menuBar);
        settingsDock = new QDockWidget(MainWindow);
        settingsDock->setObjectName(QStringLiteral("settingsDock"));
        settingsDock->setMinimumSize(QSize(160, 211));
        settingsDock->setFeatures(QDockWidget::DockWidgetMovable);
        settingsDockContent = new QWidget();
        settingsDockContent->setObjectName(QStringLiteral("settingsDockContent"));
        settingsDockContent->setAutoFillBackground(false);
        settingsLayout = new QVBoxLayout(settingsDockContent);
        settingsLayout->setSpacing(6);
        settingsLayout->setContentsMargins(11, 11, 11, 11);
        settingsLayout->setObjectName(QStringLiteral("settingsLayout"));
        shapeGroupBox = new QGroupBox(settingsDockContent);
        shapeGroupBox->setObjectName(QStringLiteral("shapeGroupBox"));
        shapeTriangle = new QRadioButton(shapeGroupBox);
        shapeTriangle->setObjectName(QStringLiteral("shapeTriangle"));
        shapeTriangle->setGeometry(QRect(10, 30, 140, 22));
        shapeTriangle->setChecked(true);
        shapeTriangleFan = new QRadioButton(shapeGroupBox);
        shapeTriangleFan->setObjectName(QStringLiteral("shapeTriangleFan"));
        shapeTriangleFan->setGeometry(QRect(10, 90, 140, 22));
        shapeTriangleStrip = new QRadioButton(shapeGroupBox);
        shapeTriangleStrip->setObjectName(QStringLiteral("shapeTriangleStrip"));
        shapeTriangleStrip->setGeometry(QRect(10, 60, 140, 22));
        linesEnabled = new QCheckBox(shapeGroupBox);
        linesEnabled->setObjectName(QStringLiteral("linesEnabled"));
        linesEnabled->setEnabled(true);
        linesEnabled->setGeometry(QRect(10, 120, 151, 22));
        linesEnabled->setChecked(false);

        settingsLayout->addWidget(shapeGroupBox);

        settingsDock->setWidget(settingsDockContent);
        MainWindow->addDockWidget(static_cast<Qt::DockWidgetArea>(1), settingsDock);

        menuBar->addAction(menuFile->menuAction());
        menuFile->addAction(actionQuit);

        retranslateUi(MainWindow);
        QObject::connect(actionQuit, SIGNAL(triggered()), MainWindow, SLOT(close()));

        QMetaObject::connectSlotsByName(MainWindow);
    } // setupUi

    void retranslateUi(QMainWindow *MainWindow)
    {
        MainWindow->setWindowTitle(QApplication::translate("MainWindow", "Lab 1 - OpenGL Basics", nullptr));
        actionQuit->setText(QApplication::translate("MainWindow", "&Quit", nullptr));
#ifndef QT_NO_SHORTCUT
        actionQuit->setShortcut(QApplication::translate("MainWindow", "Ctrl+Q", nullptr));
#endif // QT_NO_SHORTCUT
        menuFile->setTitle(QApplication::translate("MainWindow", "Fi&le", nullptr));
        shapeGroupBox->setTitle(QApplication::translate("MainWindow", "Shape", nullptr));
        shapeTriangle->setText(QApplication::translate("MainWindow", "Triangle", nullptr));
        shapeTriangleFan->setText(QApplication::translate("MainWindow", "Triangle fan", nullptr));
        shapeTriangleStrip->setText(QApplication::translate("MainWindow", "Triangle strip", nullptr));
        linesEnabled->setText(QApplication::translate("MainWindow", "Draw lines", nullptr));
    } // retranslateUi

};

namespace Ui {
    class MainWindow: public Ui_MainWindow {};
} // namespace Ui

QT_END_NAMESPACE

#endif // UI_MAINWINDOW_H
