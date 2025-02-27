import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { Box, Flex, Text } from 'theme-ui'
import ForceTheme from '../../components/force-theme'
import Head from 'next/head'
import Meta from '@hackclub/meta'
import FlexCol from '../../components/flex-col'
import Progress from '../../components/bank/apply/progress'
import NavButton from '../../components/bank/apply/nav-button'
import Watermark from '../../components/bank/apply/watermark'
import FormContainer from '../../components/bank/apply/form-container'
import BankInfo from '../../components/bank/apply/bank-info'
import OrganizationInfoForm from '../../components/bank/apply/org-form'
import PersonalInfoForm from '../../components/bank/apply/personal-form'
import AlertModal from '../../components/bank/apply/alert-modal'
import { search, geocode } from '../../lib/bank/apply/address-validation'

export default function Apply() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const formContainer = useRef()
  const [formError, setFormError] = useState(null)

  const requiredFields = [
    [],
    ['eventName', 'eventLocation'],
    ['firstName', 'lastName', 'userEmail']
  ]

  useEffect(() => {
    console.log(`Form error: ${formError}`)
    if (!router.isReady) return
    setStep(parseInt(router.query.step))

    // Set the query url parameter to 1 if it's not present
    if (!step || step < 1) {
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, step: 1 }
        },
        undefined,
        {}
      )
    }
  }, [formError, router, step])

  return (
    <>
      <script
        async
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyApxZZ8-Eh_6RgHUu8-BAOpx3xhfF2yK9U&libraries=places&mapInit=foo"
      ></script>

      <Meta as={Head} title="Apply for Hack Club Bank" />
      <ForceTheme theme="dark" />

      <Box
        sx={{
          display: 'grid',
          gap: 5,
          gridTemplateAreas: [
            '"title" "form" "form" "nav"',
            null,
            null,
            '"title form" "title form" "nav form"'
          ],
          height: ['auto', null, null, '100vh'],
          p: [4, 5]
        }}
      >
        <Box sx={{ gridArea: 'title' }}>
          <FlexCol gap={[4, null, null, '20vh']}>
            <Text variant="title">
              Let's get you
              <br />
              set up on bank.
            </Text>
            <Progress />
          </FlexCol>
        </Box>
        <Box sx={{ gridArea: 'form', overflowY: 'auto' }}>
          <FormContainer ref={formContainer}>
            {step === 1 && <BankInfo />}
            {step === 2 && (
              <OrganizationInfoForm requiredFields={requiredFields} />
            )}
            {step === 3 && <PersonalInfoForm requiredFields={requiredFields} />}
          </FormContainer>
        </Box>
        <Flex
          sx={{
            gridArea: 'nav',
            alignSelf: 'end',
            alignItems: 'flex-end',
            justifyContent: 'space-between'
          }}
        >
          <NavButton isBack={true} form={formContainer} />
          <NavButton
            isBack={false}
            form={formContainer}
            setFormError={setFormError}
            requiredFields={requiredFields}
            clickHandler={async () => {
              //TODO: Put this somewhere else

              // Validate the address
              if (step === 3) {
                // Get the raw personal address input
                const userAddress = sessionStorage.getItem(
                  'bank-signup-userAddressRaw'
                )
                if (!userAddress) return

                const result = await geocode(userAddress)

                const addrComp = type =>
                  result.results[0].structuredAddress[type]

                const thoroughfare = addrComp('fullThoroughfare')
                const city = addrComp('locality')
                const state = addrComp('administrativeArea')
                const postalCode = addrComp('postal_code')
                const country = result.results[0].country
                const countryCode = result.results[0].countryCode

                sessionStorage.setItem('bank-signup-addressLine1', thoroughfare)
                sessionStorage.setItem('bank-signup-addressCity', city ?? '')
                sessionStorage.setItem('bank-signup-addressState', state ?? '')
                sessionStorage.setItem(
                  'bank-signup-addressZip',
                  postalCode ?? ''
                )
                sessionStorage.setItem(
                  'bank-signup-addressCountry',
                  country ?? ''
                )
                sessionStorage.setItem(
                  'bank-signup-addressCountryCode',
                  countryCode ?? ''
                )
              }
            }}
          />
        </Flex>
      </Box>
      <AlertModal formError={formError} setFormError={setFormError} />
      <Watermark />
    </>
  )
}
