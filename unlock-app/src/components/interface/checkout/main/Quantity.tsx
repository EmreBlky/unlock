import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { Fragment, useState } from 'react'
import { useConfig } from '~/utils/withConfig'
import { getLockProps } from '~/utils/lock'
import { Button } from '@unlock-protocol/ui'
import {
  RiTimer2Line as DurationIcon,
  RiCoupon2Line as QuantityIcon,
} from 'react-icons/ri'
import { useActor } from '@xstate/react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import { LabeledItem } from '../LabeledItem'
import { useCheckoutSteps } from './useCheckoutItems'
import { Pricing } from '../Lock'
import { ViewContract } from '../ViewContract'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

export function Quantity({ injectedProvider, checkoutService }: Props) {
  const [state, send] = useActor(checkoutService)
  const config = useConfig()

  const { paywallConfig, quantity: selectedQuantity } = state.context
  const lock = state.context.lock!

  const lockConfig = paywallConfig.locks[lock.address]

  const maxRecipients =
    lockConfig.maxRecipients || paywallConfig.maxRecipients || 1

  const minRecipients =
    lockConfig.minRecipients || paywallConfig.minRecipients || 1

  const [quantityInput, setQuantityInput] = useState(
    selectedQuantity?.toString() || minRecipients.toString()
  )

  const quantity = Number(quantityInput)

  const formattedData = getLockProps(
    lock,
    lock!.network,
    config.networks[lock!.network].baseCurrencySymbol,
    lock!.name,
    quantity
  )

  const isDisabled = quantity < 1
  const stepItems = useCheckoutSteps(checkoutService)

  return (
    <Fragment>
      <Stepper position={2} service={checkoutService} items={stepItems} />
      <main className="h-full p-6 space-y-2 overflow-auto">
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-bold"> {lock?.name}</h3>
            <div className="grid text-right">
              <Pricing
                keyPrice={formattedData.formattedKeyPrice}
                usdPrice={formattedData.convertedKeyPrice}
                isCardEnabled={formattedData.cardEnabled}
              />
            </div>
          </div>
          <div className="flex justify-between w-full">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-4">
                <LabeledItem
                  label="Duration"
                  icon={DurationIcon}
                  value={formattedData.formattedDuration}
                />
                <LabeledItem
                  label="Quantity"
                  icon={QuantityIcon}
                  value={
                    formattedData.isSoldOut
                      ? 'Sold out'
                      : formattedData.formattedKeysAvailable
                  }
                />
              </div>
              <ViewContract
                network={lock!.network}
                lockAddress={lock!.address}
              />
            </div>
            <div>
              <input
                aria-label="Quantity"
                onChange={(event) => {
                  event.preventDefault()
                  const count = event.target.value.replace(/\D/, '')
                  const countInt = parseInt(count, 10)
                  const maxAllowed = countInt > maxRecipients
                  const minAllowed = countInt < minRecipients

                  if (maxAllowed) {
                    ToastHelper.error(
                      `You cannot purchase more than ${maxRecipients} memberships at once`
                    )
                    return setQuantityInput(maxRecipients!.toString())
                  }

                  if (minAllowed) {
                    ToastHelper.error(
                      `You cannot purchase less than ${minRecipients} memberships at once`
                    )
                    return setQuantityInput(minRecipients!.toString())
                  }

                  setQuantityInput(count)
                }}
                pattern="[0-9]{0,2}"
                value={quantityInput}
                type="text"
                className="w-16 text-sm border-2 border-gray-300 rounded-lg focus:ring-0 focus:border-brand-ui-primary"
              ></input>
            </div>
          </div>
        </div>
      </main>
      <footer className="items-center px-6 pt-6 border-t">
        <Connected
          service={checkoutService}
          injectedProvider={injectedProvider}
        >
          <div className="grid">
            <Button
              disabled={isDisabled}
              onClick={async (event) => {
                event.preventDefault()
                send({
                  type: 'SELECT_QUANTITY',
                  quantity,
                })
              }}
            >
              {quantity > 1 ? `Buy ${quantity} memberships` : 'Next'}
            </Button>
          </div>
        </Connected>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
