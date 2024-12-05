@Library('devops-shared-lib')_

pipeline {
    parameters {
        string( name: 'Version',
                defaultValue: '',
                description: '''version of the madule, e.g. 1.0.0,
                disclamer I give 💩 about the version in the code.
                if Version parameter empty
                    will use the version from package.json if avalable (on npm),
                    if not available
                        add to patch version to the last version available on npm
                else
                    will use the version provided if avalable (on npm)
                    if not available
                        error the pipeline with a message to provide a new version''')
        booleanParam(name: 'TEST', defaultValue: false, description: 'Run tests')

        booleanParam(name: 'TEST_SECURE_CODE', defaultValue: false, description: 'test the code for security vulnerabilities')
    
    }
    environment {
        BuildNumber = "${env.BUILD_NUMBER}"
        branchName = "${env.BRANCH_NAME}"
        HOME = '.'
        project = 'vendure-core'
        GITHUB_TOKEN = credentials('GITHUB_TOKEN')
    }
    options {
        disableConcurrentBuilds()
        // buildDiscarder(logRotator(numToKeepStr:'5'))
        timeout(time: 40, unit: 'MINUTES')
        ansiColor('xterm')
    }

    agent {
        docker {
            label 'ci-linux-srv'
            image 'node:18.12.1'
        }
    }

    stages {
        stage('Run SCA Scan') {
            steps {
                script {
                    securityUtils.snykReport("linux")
                }
            }
        }
    
        stage('setup and print env') {
            steps {
                script {
                    sh 'echo "Public IP: $(curl -s ifconfig.me)"'
                    echo 'whoami'
                    sh 'node --version'
                    sh 'npm --version'
                    sh 'apt-get update && apt-get install -y jq tree'
                    sh 'git config --global user.email "you@example.com"'
                    sh 'git config --global user.name "Your Name"'
                    // sh 'rm -rf node_modules dist test/reports'
                    sh 'rm -rf node_modules test/reports'
                    sh 'printenv'
                }
            }
        }

        stage('Build Node. JS project') {
            steps {
                script {
                    sh 'ls -la'
                    npmUtils.cleanInstall()
                    
                }
            }
        }

        stage('Run tests') {
            when { expression { params.TEST } }
            steps {
                script {
                    dir('test') {
                        sh 'npm install'
                        sh 'npm run test'
                        while (true) {
                            def exists2 = fileExists "${env.WORKSPACE}/test/reports/junit/test.junit.xml"
                            echo "test.junit.xml exists: ${exists2}"
                            if (exists2) break
                            sh 'tree test/reports/'
                            echo 'Waiting 5 sec for test results...'
                            sleep(time: '5', unit: 'SECONDS')
                        }
                        junit '**/test.junit.xml'
                    }
                }
            }
        }

        stage('Update version') {
            steps {
                script {
                    def newVersion = ''
                    withNPM(npmrcConfig: 'push-to-vendure-core') {
                        echo 'provided version: ' + params.Version
                        if (params.Version == '') {
                            echo 'no version provided, check availability on npm'
                            echo 'get version in package.json'
                            def currentVersion = sh(script: "jq .version package.json", returnStdout: true).trim().replace('"', '')
                            echo "Current Version: ${currentVersion}"
                            echo 'get versions from npm'
                            def versionsFromNpm = sh(script: "npm view @c2m/${env.project} versions", returnStdout: true).trim().replace('[', '').replace(']', '').replace('"', '')
                            echo "versionsFromNpm: ${versionsFromNpm}"
                            def checkContains = versionsFromNpm.contains(currentVersion)
                            echo "checkContains: ${checkContains}"
                            if (checkContains) {
                                echo "version in package.json available on npm, cant use it to update package, patching the last version available on npm"
                                def versionFromNpm = sh(script: "npm view @c2m/${env.project} version", returnStdout: true).trim()
                                echo "versionFromNpm: ${versionFromNpm}"
                                def versionParts = versionFromNpm.split('\\.')
                                def patchVersion = Integer.parseInt(versionParts[2]) + 1
                                newVersion = "${versionParts[0]}.${versionParts[1]}.$patchVersion"
                            } else {
                                echo "version in package.json not available on npm, using it to update package"
                                newVersion = currentVersion
                            }
                            echo "New version: $newVersion"
                        } else {
                            echo 'version provided, check availability on npm'
                            def versionsFromNpm = sh(script: "npm view @c2m/${env.project} versions", returnStdout: true).trim().replace('[', '').replace(']', '').replace('"', '')
                            echo "versionsFromNpm: ${versionsFromNpm}"
                            def version = params.Version.replace('"', '')
                            if (versionsFromNpm.contains("\"${version}\"")) {
                                echo 'version available on npm, fail the pipeline with a message to provide a new version'
                                error "Version ${version} already exists on npm, please provide a new version"
                            } else {
                                echo 'version not available on npm, update the version'
                                newVersion = version
                            }
                        }
                    }
                    def currentVersion = sh(script: "jq .version package.json", returnStdout: true).trim().replace('"', '')
                    echo "Current Version: ${currentVersion}"
                    echo "New Version: ${newVersion}"
                    if (currentVersion != newVersion) {
                        sh "npm version ${newVersion} --git-tag-version false"
                        
                    } else {
                        echo "Version already up to date"
                        echo "make sure the same is in src/package.json"
                        
                    }
                }
            }
        }


        stage('Publish to npm') {
            steps {
                script {
                    withNPM(npmrcConfig: 'push-to-vendure-core') {
                            echo 'Publish to npm'
                            sh 'npm publish --private'
                        }
                    // npmUtils.build()
                    // dir('dist') {
                    //     withNPM(npmrcConfig: 'push-to-vendure-core') {
                    //         echo 'Publish to npm'
                    //         sh 'npm publish --private'
                    //     }
                    // }
                }
            }
        }
    }

    post {
        always {
            script {
                echo 'always - run before success or failure'
                sendNotifications currentBuild.result
            }
        }
        failure {
            script {
                echo 'Failure - runs after always'
            }
        }
        success {
            script {
                echo 'Success - runs after always'

            }
        }
        unstable {
            script {
                echo 'Unstable - runs on failed '
            }
        }
        aborted {
            script {
                echo 'Aborted - runs on aborted'
            }
        }
    }
}