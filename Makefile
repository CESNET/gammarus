PREFIX=/usr

containing = $(foreach v,$2,$(if $(findstring $1,$v),$v))
not-containing = $(foreach v,$2,$(if $(findstring $1,$v),,$v))

restconf-full-spectrum-scan.sh: templates/restconf-wrapper-begin.sh
	cat $^ > $@
	echo /bin/cla-restconf-rpc-sdn-roadm-demo full-spectrum-scan >> $@
	chmod +x $@

.PHONY: install install-binaries install-services install-static-files install-nghttpx-device-specific

install-binaries: restconf-full-spectrum-scan.sh restconf-data.sh
	mkdir -p $(DESTDIR)$(PREFIX)/bin
	cp $^ $(DESTDIR)$(PREFIX)/bin

install-services: $(wildcard *.service)
	mkdir -p $(DESTDIR)$(PREFIX)/lib/systemd/system/multi-user.target.wants/
	cp $^ $(DESTDIR)$(PREFIX)/lib/systemd/system/
	$(foreach unit,$(call not-containing,@,$^),ln -sf ../$(unit) $(DESTDIR)$(PREFIX)/lib/systemd/system/multi-user.target.wants/;)

install-static-files: sdn-roadm-line sdn-roadm-add-drop sdn-roadm-coherent-a-d
	mkdir -p $(DESTDIR)$(PREFIX)/share/gammarus/static/
	$(foreach device,$^,cp -a $(device) $(DESTDIR)$(PREFIX)/share/gammarus/static/;)
	$(foreach device,$^,ln -sf ../nghttpd@.service $(DESTDIR)$(PREFIX)/lib/systemd/system/multi-user.target.wants/nghttpd@$(device).service;)
	$(foreach device,$^,ln -sf ../nghttpx@.service $(DESTDIR)$(PREFIX)/lib/systemd/system/multi-user.target.wants/nghttpx@$(device).service;)

install-nghttpx-device-specific: $(wildcard conf-nghttpx/*.conf)
	mkdir -p $(DESTDIR)$(PREFIX)/share/gammarus/nghttpx-conf/
	cp $^ $(DESTDIR)$(PREFIX)/share/gammarus/nghttpx-conf/

install: install-binaries install-services install-static-files install-nghttpx-device-specific
