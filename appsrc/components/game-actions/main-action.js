
import React, {Component, PropTypes} from 'react'
import {connect} from '../connect'
import classNames from 'classnames'

import Icon from '../icon'
import TaskIcon from '../task-icon'

import format from '../../util/format'

const linearGradient = (progress) => {
  let percent = (progress * 100).toFixed() + '%'
  let doneColor = '#414141'
  let undoneColor = '#2B2B2B'
  return `-webkit-linear-gradient(left, ${doneColor}, ${doneColor} ${percent}, ${undoneColor} ${percent}, ${undoneColor})`
}

class MainAction extends Component {
  render () {
    const {t, cancellable, platform, platformCompatible, mayDownload, pressDownload, canBeBought, progress, task, action, animate} = this.props

    let child = ''
    if (task) {
      child = <span className='state normal-state'>
        <TaskIcon task={task} animate={animate} action={action}/>
        {this.status()}
        {cancellable
        ? <span className='cancel-cross'>
          <Icon icon='cross'/>
        </span>
        : ''}
      </span>
    } else {
      if (platformCompatible) {
        if (mayDownload) {
          child = <span className='state'>
            <Icon icon='install'/>
            {t('grid.item.' + (pressDownload ? 'review' : 'install'))}
          </span>
        } else if (canBeBought) {
          child = <span className='state'>
            <Icon icon='shopping_cart'/>
            {t('grid.item.buy_now')}
          </span>
        }
      } else {
        return <span className='state not-platform-compatible'>
          {t('grid.item.not_platform_compatible', {platform: format.itchPlatform(platform)})}
        </span>
      }
    }

    let style = {}
    let branded = false
    if (progress > 0) {
      style.backgroundImage = linearGradient(progress)
      style.borderColor = '#444'
    } else {
      const {dominantColor} = this.props
      if (dominantColor) {
        branded = true
        style.background = dominantColor
      }
    }

    const hint = this.hint()

    const buttonClasses = classNames('main-action', {
      'buy-now': (platformCompatible && !mayDownload && canBeBought),
      'hint--top': hint,
      branded
    })
    const button = <div style={style} className={buttonClasses} onClick={() => this.onClick()} data-hint={hint}>
      {child}
    </div>

    if (child === '') {
      return <div/>
    }

    return button
  }

  hint () {
    const {t, task} = this.props

    if (task === 'error') {
      return t('grid.item.report_problem')
    }
  }

  onClick () {
    let {task, cave, game, platformCompatible, mayDownload} = this.props
    const {reportCave, navigate, queueGame, initiatePurchase, browseGame, abortGameRequest} = this.props

    if (task === 'error') {
      reportCave(cave.id)
    } else if (task === 'download' || task === 'find-upload') {
      navigate('downloads')
    } else {
      if (platformCompatible) {
        if (task === 'launch') {
          abortGameRequest(game)
        } else if (!task || task === 'idle') {
          if (mayDownload || cave) {
            queueGame(game)
          } else {
            initiatePurchase(game)
          }
        }
      } else {
        browseGame(game.id, game.url)
      }
    }
  }

  status () {
    const {t, task, action} = this.props

    if (task === 'idle' || task === 'awaken') {
      switch (action) {
        case 'open':
          return t('grid.item.open')
        case 'launch':
        default:
          return t('grid.item.launch')
      }
    }

    if (task === 'error' || task === 'reporting') {
      return ''
    }

    if (task === 'launch') {
      return t('grid.item.running')
    }

    let res = t('grid.item.installing')
    if (task === 'uninstall') {
      res = t('grid.item.uninstalling')
    }
    if (task === 'download' || task === 'find-upload') {
      res = t('grid.item.downloading')
    }
    if (task === 'ask-before-install') {
      res = t('grid.item.finalize_installation')
    }
    if (task === 'download-queued') {
      res = t('grid.item.queued')
    }

    return res
  }
}

MainAction.propTypes = {
  // specified
  game: PropTypes.shape({
    id: PropTypes.any.isRequired
  }),
  dominantColor: PropTypes.string,

  // derived
  animate: PropTypes.bool,
  action: PropTypes.string,
  cave: PropTypes.any,
  mayDownload: PropTypes.bool,
  platform: PropTypes.string,
  platformCompatible: PropTypes.bool,
  task: PropTypes.string,
  progress: PropTypes.number,
  cancellable: PropTypes.bool,

  t: PropTypes.func.isRequired,
  queueGame: PropTypes.func.isRequired,
  reportCave: PropTypes.func.isRequired,
  cancelCave: PropTypes.func.isRequired,
  initiatePurchase: PropTypes.func.isRequired,
  browseGame: PropTypes.func.isRequired,
  abortGameRequest: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired
}

export default connect()(MainAction)
