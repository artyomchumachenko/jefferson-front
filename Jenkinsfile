pipeline {
  agent any

  // Добавляем параметр
  parameters {
    booleanParam(
      name: 'FORCE_BUILD',
      defaultValue: false,
      description: 'Если true — игнорировать отсутствие новых коммитов и всё равно собрать/задеплоить'
    )
  }

  environment {
    GIT_CREDENTIALS = 'TSSH'
    REPO_URL        = 'git@github.com:artyomchumachenko/jefferson-front.git'
    BRANCH          = 'master'
    WORK_TREE       = '/opt/myapp/frontend'
    DEPLOY_DIR      = '/var/www/myapp/mai/jefferson'
    NGINX_SERVICE   = 'nginx.service'
  }

  stages {
    stage('Checkout & Fetch') {
      steps {
        sshagent([env.GIT_CREDENTIALS]) {
          sh '''
            if [ ! -d "$WORK_TREE/.git" ]; then
              echo "[$(date)] Инициализируем репозиторий..."
              rm -rf "$WORK_TREE"
              git clone "$REPO_URL" --branch "$BRANCH" "$WORK_TREE"
            fi
            cd "$WORK_TREE"
            git fetch origin "$BRANCH"
          '''
        }
      }
    }

    stage('Check for Changes') {
      steps {
        dir("${WORK_TREE}") {
          script {
            // По умолчанию — не строим
            shouldBuild = false

            if (params.FORCE_BUILD) {
              echo "🚀 Принудительная сборка: FORCE_BUILD=true"
              shouldBuild = true
            } else {
              def remote = sh(script: "git rev-parse origin/${BRANCH}", returnStdout: true).trim()
              def local  = sh(script: "git rev-parse HEAD",              returnStdout: true).trim()

              if (remote != local) {
                echo "🔄 Новые коммиты: ${local} → ${remote}"
                sh "git reset --hard origin/${BRANCH}"
                shouldBuild = true
              } else {
                echo "✅ Нет новых коммитов (HEAD=${local}), пропускаем build/deploy"
              }
            }
          }
        }
      }
    }

    stage('Build') {
      when { expression { shouldBuild } }
      steps {
        dir("${WORK_TREE}") {
          sh '''
            echo "[$(date)] npm ci"
            npm ci
            echo "[$(date)] npm run build"
            npm run build
          '''
        }
      }
    }

    stage('Deploy') {
      when { expression { shouldBuild } }
      steps {
        sh '''
          echo "[$(date)] Подготовка директории ${DEPLOY_DIR}"
          mkdir -p ${DEPLOY_DIR}
          rm -rf ${DEPLOY_DIR}/*

          echo "[$(date)] rsync dist → deploy"
          rsync -a --delete ${WORK_TREE}/dist/ ${DEPLOY_DIR}/

          echo "[$(date)] Проверка конфигурации nginx"
          if sudo nginx -t; then
            echo "[$(date)] Перезагружаем nginx"
            systemctl reload ${NGINX_SERVICE}
          else
            echo "[$(date)] ❌ Конфиг nginx невалиден"
            exit 1
          fi
        '''
      }
    }
  }

  post {
    success {
      script {
        if (shouldBuild) {
          echo '✅ Сборка и деплой прошли успешно'
        } else {
          echo 'ℹ️ Сборка и деплой не требуются'
        }
      }
    }
    failure {
      echo '❌ Произошла ошибка, смотрите логи'
    }
  }
}
