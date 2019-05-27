// @ts-ignore
import { Control } from 'UI/Base';
// @ts-ignore
import template = require('wml!HotKeys/_base/KeyHook');
// @ts-ignore
import { DOMEnvironment } from 'Vdom/Vdom';
// @ts-ignore
import Dispatcher from 'HotKeys/_base/Dispatcher';

/**
 * Создание события нажатия определенной клавиши
 */
function createEvent(key: string): object {
    var eventObj;
    if (document.createEventObject) {
        eventObj = document.createEventObject();
        eventObj.keyCode = key;
    } else if (document.createEvent) {
        eventObj = document.createEvent('Events');
        eventObj.initEvent('keydown', true, true);
        eventObj.which = key;
        eventObj.keyCode = key;
    }
    return eventObj;
}

/**
 * Контрол KeyHook - контрол, который указывает клавиши, нажатие на которые будет обработано по умолчанию дочерним контролом.
 * Он регистрирует клавиши по умолчанию для всех предков, у которых еще нет зарегистрированного действия на эту клавишу, и,
 * в случае необработанного нажатия этих клавиш, в дочерний контрол будет перенаправлено событие о нажатии на клавишу, и там будет обработано.
 */
class KeyHook extends Control {
    // набор действий по умолчанию, зарегистрированных на определенные клавиши
    private _actions: object = {};

    _afterMount(): void {
        // опция defaultActions хранит набор клавиш, которые будут обработаны по умолчанию
        if (this._options.defaultActions) {
            const parents = DOMEnvironment._goUpByControlTree(this._container);

            // собираем всех предков, и говорим им, какое действие по умолчанию нужно выполнить на необработанное нажатие клавиш
            this._options.defaultActions.forEach((action) => {
                for (let i = 0; i < parents.length; i++) {
                    const parent = parents[i];

                    // если у контрола уже есть зарегистрированное действие по умолчанию на эту клавишу, перестаем регистрацию
                    if (parent._$defaultActions && parent._$defaultActions[action.keyCode]) {
                        break;
                    }
                    // выше контрола Dispatcher не регистрируем. Dispatcher ограничивает область перехвата и регистрации действий по умолчанию.
                    if (parent.constructor === Dispatcher) {
                        break;
                    }
                    parent._$defaultActions = parent._$defaultActions || {};

                    // действием по умолчанию будет отправка события нажатия на клавишу по умолчанию,
                    // это событие будет всплывать от контрола, обернутого в KeyHook.
                    // таким образом мы как бы перенаправляем событие нажатия клавиши из места, где оно не обработано - в место, где оно обрабатывается по умолчанию.
                    this._actions[action.keyCode] = this._actions[action.keyCode] || {
                        action: function() {
                            var event = createEvent(action.keyCode);
                            this._container.dispatchEvent(event);
                        }.bind(this)
                    };

                    parent._$defaultActions[action.keyCode] = this._actions[action.keyCode];
                }
            });
        }
    }
    _beforeUnmount(): void {
        // при удалении контрола произведем разрегистрацию.
        if (this._options.defaultActions) {
            const parents = DOMEnvironment._goUpByControlTree(this._container);
            this._options.defaultActions.forEach((action) => {
                for (let i = 0; i < parents.length; i++) {
                    const parent = parents[i];
                    if (parent._$defaultActions && parent._$defaultActions[action.keyCode] === this._actions[action.keyCode]) {
                        delete parent._$defaultActions[action.keyCode];
                    } else {
                        break;
                    }
                }
            });
        }
    }
}

// @ts-ignore
KeyHook.prototype._template = template;

export default KeyHook;